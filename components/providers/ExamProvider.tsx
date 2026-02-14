'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface ExamContextType {
    isExamActive: boolean
    setIsExamActive: (active: boolean) => void
}

const ExamContext = createContext<ExamContextType | undefined>(undefined)

export function ExamProvider({ children }: { children: React.ReactNode }) {
    const [isExamActive, setIsExamActive] = useState(false)

    return (
        <ExamContext.Provider value={{ isExamActive, setIsExamActive }}>
            {children}
        </ExamContext.Provider>
    )
}

export function useExam() {
    const context = useContext(ExamContext)
    if (context === undefined) {
        throw new Error('useExam must be used within an ExamProvider')
    }
    return context
}
