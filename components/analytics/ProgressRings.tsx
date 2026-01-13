import React from 'react'
import { motion } from 'framer-motion'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  label?: string
  value?: string | number
  animated?: boolean
}

export default function ProgressRings({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color = 'hsl(var(--primary))',
  backgroundColor = 'hsl(var(--muted))',
  label,
  value,
  animated = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const ringVariants = {
    hidden: { strokeDashoffset: circumference },
    visible: { 
      strokeDashoffset: strokeDashoffset,
      transition: { duration: 1.5, ease: "easeOut" }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            {...(animated && {
              variants: ringVariants,
              initial: "hidden",
              animate: "visible"
            })}
            {...(!animated && {
              style: { strokeDashoffset }
            })}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-2xl font-bold text-foreground"
            {...(animated && {
              initial: { opacity: 0, scale: 0.5 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.5, duration: 0.5 }
            })}
          >
            {value || `${Math.round(percentage)}%`}
          </motion.span>
        </div>
      </div>
      
      {label && (
        <motion.p 
          className="text-sm text-muted-foreground text-center font-medium"
          {...(animated && {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.8, duration: 0.3 }
          })}
        >
          {label}
        </motion.p>
      )}
    </div>
  )
}

interface MultiProgressRingsProps {
  rings: {
    percentage: number
    label: string
    value?: string | number
    color?: string
  }[]
  size?: number
  className?: string
}

export function MultiProgressRings({ rings, size = 120, className = "" }: MultiProgressRingsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}>
      {rings.map((ring, index) => (
        <motion.div
          key={ring.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <ProgressRings
            percentage={ring.percentage}
            label={ring.label}
            {...(ring.value !== undefined && { value: ring.value })}
            color={ring.color || 'hsl(var(--primary))'}
            size={size}
          />
        </motion.div>
      ))}
    </div>
  )
}

interface ComparisonProgressRingProps {
  current: number
  previous: number
  label: string
  size?: number
}

export function ComparisonProgressRing({ 
  current, 
  previous, 
  label, 
  size = 140 
}: ComparisonProgressRingProps) {
  const improvement = current - previous
  const improvementColor = improvement >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
  
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Previous performance (background) */}
        <ProgressRings
          percentage={previous}
          size={size}
          color="hsl(var(--muted-foreground))"
          backgroundColor="hsl(var(--muted))"
          animated={false}
        />
        
        {/* Current performance (foreground) */}
        <div className="absolute inset-0">
          <ProgressRings
            percentage={current}
            size={size}
            strokeWidth={6}
            color="hsl(var(--primary))"
            backgroundColor="transparent"
          />
        </div>
        
        {/* Center content with comparison */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {Math.round(current)}%
          </span>
          <motion.div 
            className="flex items-center space-x-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            <span 
              className="text-xs font-medium"
              style={{ color: improvementColor }}
            >
              {improvement >= 0 ? '+' : ''}{Math.round(improvement * 10) / 10}%
            </span>
            <span className="text-xs">
              {improvement >= 0 ? '↗' : '↘'}
            </span>
          </motion.div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center font-medium">
        {label}
      </p>
    </div>
  )
}

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  suffix = '', 
  prefix = '',
  className = "text-3xl font-bold"
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * easeOut))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
