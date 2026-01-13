'use client'

import { Upload, Brain, Timer, BarChart3, FileText, Zap, Sparkles, Target, TrendingUp } from 'lucide-react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { MagneticButton } from '@/components/ui/MagneticButton'

// Letter reveal animation component
function AnimatedText({ text, className = '' }: { text: string; className?: string }) {
  const letters = text.split('')
  
  return (
    <span className={className}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="letter-reveal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.03,
            ease: "easeOut"
          }}
          style={{ 
            display: letter === ' ' ? 'inline' : 'inline-block',
            animationDelay: `${index * 0.03}s`
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  )
}

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return { ref, isInView }
}

// Bento grid card component
function BentoCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  className = ''
}: {
  icon: any
  title: string
  description: string
  delay?: number
  className?: string
}) {
  const { ref, isInView } = useScrollReveal()
  
  return (
    <motion.div
      ref={ref}
      className={`bento-card glass glass-hover p-8 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6"
        whileHover={{ 
          rotate: 5,
          scale: 1.1
        }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

export default function Home() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-x-hidden">
      <ParticleBackground />
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-4 pt-16"
        style={{ y: heroY, opacity: heroOpacity }}
      >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="glass glass-hover p-12 rounded-3xl mb-8"
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AnimatedText 
                  text="AI-Powered" 
                  className="gradient-text block"
                />
                <AnimatedText 
                  text="Exam Fever" 
                  className="text-white dark:text-white block"
                />
                <AnimatedText 
                  text="Simulator" 
                  className="gradient-text block"
                />
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                Upload your PDFs, generate practice questions with AI, and take timed exams to master your subjects with cutting-edge technology.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                <MagneticButton
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl"
                  onClick={() => window.location.href = '/register'}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Get Started Free
                  </span>
                </MagneticButton>
                
                <MagneticButton
                  className="border-2 border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm"
                  onClick={() => window.location.href = '/upload'}
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Your First PDF
                  </span>
                </MagneticButton>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works - Bento Grid */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-5xl font-bold text-center mb-16 gradient-text"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How ExamFever Works
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <BentoCard
                icon={Upload}
                title="1. Upload PDFs"
                description="Upload your textbooks, notes, and study materials in PDF format with our advanced processing engine"
                delay={0.1}
                className="lg:col-span-1"
              />
              
              <BentoCard
                icon={Brain}
                title="2. AI Generates Questions"
                description="Our cutting-edge AI analyzes your content and creates intelligent practice questions automatically"
                delay={0.2}
                className="lg:col-span-1"
              />
              
              <BentoCard
                icon={Timer}
                title="3. Take Timed Exams"
                description="Practice with realistic exam conditions, time pressure, and adaptive difficulty"
                delay={0.3}
                className="lg:col-span-1"
              />
              
              <BentoCard
                icon={BarChart3}
                title="4. Track Progress"
                description="Analyze your performance with detailed analytics and identify areas for improvement"
                delay={0.4}
                className="lg:col-span-1"
              />
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced Bento Grid */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-5xl font-bold text-center mb-16 gradient-text"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Powerful Features
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BentoCard
                icon={FileText}
                title="Smart PDF Processing"
                description="Advanced text extraction and content analysis from your study materials with AI-powered understanding"
                delay={0.1}
                className="lg:col-span-1"
              />
              
              <BentoCard
                icon={Zap}
                title="AI Question Generation"
                description="Multiple choice questions generated from your content with intelligent difficulty scaling and comprehensive answer options"
                delay={0.2}
                className="lg:col-span-1"
              />
              
              <BentoCard
                icon={Target}
                title="Realistic Exam Environment"
                description="Timed exams with progress tracking, exam-like pressure, and adaptive question selection"
                delay={0.3}
                className="lg:col-span-1"
              />
              
              <BentoCard
                icon={TrendingUp}
                title="Performance Analytics"
                description="Detailed insights into your learning patterns, strengths, and areas needing improvement"
                delay={0.4}
                className="lg:col-span-2"
              />
              
              <BentoCard
                icon={Sparkles}
                title="Adaptive Learning"
                description="AI adjusts question difficulty based on your performance for optimal learning outcomes"
                delay={0.5}
                className="lg:col-span-1"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="glass glass-hover p-12 rounded-3xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2 
                className="text-5xl font-bold mb-6 gradient-text"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Ready to Transform Your Study Sessions?
              </motion.h2>
              
              <motion.p 
                className="text-xl text-gray-300 dark:text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Join thousands of students who are already using AI to ace their exams and achieve academic excellence.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <MagneticButton
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl"
                  onClick={() => window.location.href = '/upload'}
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Your First PDF
                  </span>
                </MagneticButton>
                
                <MagneticButton
                  className="border-2 border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    View Dashboard
                  </span>
                </MagneticButton>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
  )
}