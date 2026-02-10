'use client'

import { useState } from 'react'

const categories = [
  'All Subjects',
  'Mathematics',
  'Computer Science', 
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Business',
  'Economics',
  'Literature'
]

export function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState('All Subjects')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-3 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>{selectedCategory}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  selectedCategory === category ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}