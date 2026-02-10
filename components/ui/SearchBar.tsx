'use client'

import { useState } from 'react'

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Searching for:', searchQuery)
  }

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your exams and questions..."
          className="form-input pl-10 pr-4 py-3 w-full"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <span className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Search
          </span>
        </button>
      </div>
    </form>
  )
}