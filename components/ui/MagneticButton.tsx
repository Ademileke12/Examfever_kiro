'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  magneticStrength?: number
  disabled?: boolean
}

export function MagneticButton({ 
  children, 
  className = '', 
  onClick, 
  magneticStrength = 0.3,
  disabled = false 
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const handleMouseMove = (e: MouseEvent) => {
      if (disabled) return
      
      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      // Magnetic effect radius
      const magneticRadius = Math.max(rect.width, rect.height) * 1.5
      
      if (distance < magneticRadius) {
        const strength = Math.max(0, 1 - distance / magneticRadius)
        setPosition({
          x: deltaX * strength * magneticStrength,
          y: deltaY * strength * magneticStrength
        })
        setIsHovered(true)
      } else {
        setPosition({ x: 0, y: 0 })
        setIsHovered(false)
      }
    }

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 })
      setIsHovered(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [magneticStrength, disabled])

  return (
    <motion.button
      ref={buttonRef}
      className={`magnetic relative overflow-hidden ${className}`}
      onClick={onClick}
      disabled={disabled}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0"
        animate={{
          opacity: isHovered ? 0.2 : 0,
          scale: isHovered ? 1.1 : 1
        }}
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4), transparent 70%)',
          filter: 'blur(8px)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          background: isHovered
            ? 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)'
            : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.button>
  )
}