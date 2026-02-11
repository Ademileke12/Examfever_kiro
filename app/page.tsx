'use client'

import { motion } from 'framer-motion'
import { Sparkles, Upload, ChevronDown, Brain, Timer, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const steps = [
    {
      title: "1. Upload PDFs",
      description: "Upload your textbooks, notes, and study materials in PDF format with our advanced processing engine",
      icon: Upload
    },
    {
      title: "2. AI Generates Questions",
      description: "Our cutting-edge AI analyzes your content and creates intelligent practice questions automatically",
      icon: Brain
    },
    {
      title: "3. Take Timed Exams",
      description: "Practice with realistic exam conditions, time pressure, and adaptive difficulty",
      icon: Timer
    },
    {
      title: "4. Track Progress",
      description: "Analyze your performance with detailed analytics and identify areas for improvement",
      icon: BarChart3
    }
  ]

  return (
    <div className="flex flex-col items-center px-6 py-12 md:py-20 overflow-hidden bg-white dark:bg-[#0A0A0C]">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="main-container max-w-6xl w-full p-8 md:p-24 flex flex-col items-center text-center relative overflow-hidden mb-12"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent" />

        <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-none mb-12 text-[#111114] dark:text-white">
          Exam Fever
        </h1>

        <p className="text-lg md:text-xl font-semibold text-[#6B7280] dark:text-[#9CA3AF] max-w-2xl mb-12 leading-relaxed">
          Upload your PDFs, generate practice questions with AI, and take timed exams to master your subjects with cutting-edge technology.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-12 w-full justify-center">
          <Link
            href="/register"
            className="btn-primary group flex items-center justify-center gap-2 min-w-[240px]"
          >
            <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
            Get Started Free
          </Link>
          <Link
            href="/upload"
            className="btn-outline flex items-center justify-center gap-2 min-w-[240px]"
          >
            <Upload className="w-5 h-5" />
            Upload Your First PDF
          </Link>
        </div>

        {/* Stats Section */}
        <div className="w-full h-px bg-gray-100 dark:bg-white/5 mb-12" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 w-full">
          {[
            { label: 'Students', value: '10k+' },
            { label: 'Exams Created', value: '50k+' },
            { label: 'Success Rate', value: '98%' },
            { label: 'AI Support', value: '24/7' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black mb-1 text-[#111114] dark:text-white">{stat.value}</span>
              <span className="text-[10px] font-black tracking-[0.2em] text-[#9CA3AF] uppercase">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How ExamFever Works */}
      <div className="w-full max-w-7xl py-12 md:py-24 px-6">
        <h2 className="text-4xl md:text-7xl font-black mb-12 md:mb-20 text-center gradient-text">
          How ExamFever Works
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-start p-8 md:p-12 glass glass-hover rounded-[2.5rem] md:rounded-[3rem] group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#7C3AED] rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-[#7C3AED]/30 group-hover:scale-110 transition-transform">
                <step.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-[#111114] dark:text-white tracking-tight leading-tight">
                {step.title}
              </h3>
              <p className="text-base font-semibold text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learn More */}
      <div className="mt-12 mb-20 flex flex-col items-center gap-4 animate-bounce">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#9CA3AF] uppercase">Learn More</span>
        <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />
      </div>
    </div>
  )
}