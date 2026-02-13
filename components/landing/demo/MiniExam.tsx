'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Award, Clock, Play, ChevronRight } from 'lucide-react'

type Question = {
    id: number
    text: string
    options: string[]
    correct: number
    subject: string
}

// Large question pool (50 questions across various subjects)
const QUESTION_POOL: Question[] = [
    { id: 1, text: 'What is the result of 4 × 2 (4 + 5)?', options: ['36', '72', '18', '9'], correct: 1, subject: 'Mathematics' },
    { id: 2, text: 'Solve for x: 2x + 5 = 15', options: ['10', '5', '7.5', '2.5'], correct: 1, subject: 'Algebra' },
    { id: 3, text: 'What is 15% of 200?', options: ['20', '35', '30', '25'], correct: 2, subject: 'Arithmetic' },
    { id: 4, text: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Rome'], correct: 1, subject: 'Geography' },
    { id: 5, text: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correct: 1, subject: 'Literature' },
    { id: 6, text: 'What is the chemical symbol for water?', options: ['O2', 'H2O', 'CO2', 'NaCl'], correct: 1, subject: 'Chemistry' },
    { id: 7, text: 'What is 7 × 8?', options: ['54', '56', '58', '60'], correct: 1, subject: 'Mathematics' },
    { id: 8, text: 'What is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correct: 2, subject: 'Science' },
    { id: 9, text: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2, subject: 'History' },
    { id: 10, text: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correct: 2, subject: 'Mathematics' },
    { id: 11, text: 'Which element has the atomic number 1?', options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'], correct: 1, subject: 'Chemistry' },
    { id: 12, text: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], correct: 2, subject: 'Mathematics' },
    { id: 13, text: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], correct: 1, subject: 'Art' },
    { id: 14, text: 'What is the boiling point of water in Celsius?', options: ['90°C', '95°C', '100°C', '105°C'], correct: 2, subject: 'Science' },
    { id: 15, text: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2, subject: 'Geography' },
    { id: 16, text: 'What is 25 × 4?', options: ['90', '95', '100', '105'], correct: 2, subject: 'Mathematics' },
    { id: 17, text: 'Who developed the theory of relativity?', options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'], correct: 1, subject: 'Physics' },
    { id: 18, text: 'What is the speed of light?', options: ['299,792 km/s', '199,792 km/s', '399,792 km/s', '99,792 km/s'], correct: 0, subject: 'Physics' },
    { id: 19, text: 'Which organ pumps blood through the body?', options: ['Liver', 'Lungs', 'Heart', 'Brain'], correct: 2, subject: 'Biology' },
    { id: 20, text: 'What is the currency of Japan?', options: ['Yuan', 'Won', 'Yen', 'Dollar'], correct: 2, subject: 'Economics' },
    { id: 21, text: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correct: 1, subject: 'Geometry' },
    { id: 22, text: 'What is the freezing point of water in Fahrenheit?', options: ['0°F', '16°F', '32°F', '48°F'], correct: 2, subject: 'Science' },
    { id: 23, text: 'Who was the first president of the United States?', options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], correct: 1, subject: 'History' },
    { id: 24, text: 'What is 144 ÷ 12?', options: ['10', '11', '12', '13'], correct: 2, subject: 'Mathematics' },
    { id: 25, text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Mercury', 'Jupiter'], correct: 1, subject: 'Astronomy' },
    { id: 26, text: 'What is the main gas in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correct: 2, subject: 'Science' },
    { id: 27, text: 'How many degrees are in a right angle?', options: ['45°', '60°', '90°', '180°'], correct: 2, subject: 'Geometry' },
    { id: 28, text: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, subject: 'Geography' },
    { id: 29, text: 'Who invented the telephone?', options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Guglielmo Marconi'], correct: 1, subject: 'History' },
    { id: 30, text: 'What is 50% of 80?', options: ['30', '35', '40', '45'], correct: 2, subject: 'Mathematics' },
    { id: 31, text: 'How many bones are in the human body?', options: ['186', '196', '206', '216'], correct: 2, subject: 'Biology' },
    { id: 32, text: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2, subject: 'Chemistry' },
    { id: 33, text: 'Which country is home to the kangaroo?', options: ['New Zealand', 'Australia', 'South Africa', 'Brazil'], correct: 1, subject: 'Geography' },
    { id: 34, text: 'What is 9²?', options: ['72', '81', '90', '99'], correct: 1, subject: 'Mathematics' },
    { id: 35, text: 'Who wrote "To Kill a Mockingbird"?', options: ['Harper Lee', 'F. Scott Fitzgerald', 'Ernest Hemingway', 'John Steinbeck'], correct: 0, subject: 'Literature' },
    { id: 36, text: 'What is the smallest unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], correct: 2, subject: 'Biology' },
    { id: 37, text: 'How many days are in a leap year?', options: ['364', '365', '366', '367'], correct: 2, subject: 'General Knowledge' },
    { id: 38, text: 'What is the speed of sound in air (approximately)?', options: ['243 m/s', '343 m/s', '443 m/s', '543 m/s'], correct: 1, subject: 'Physics' },
    { id: 39, text: 'Which vitamin is produced by the body when exposed to sunlight?', options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'], correct: 2, subject: 'Health' },
    { id: 40, text: 'What is the perimeter of a square with side length 5?', options: ['15', '20', '25', '30'], correct: 1, subject: 'Geometry' },
    { id: 41, text: 'Who was the ancient Greek god of the sea?', options: ['Zeus', 'Hades', 'Poseidon', 'Apollo'], correct: 2, subject: 'Mythology' },
    { id: 42, text: 'What is the formula for the area of a circle?', options: ['πr', 'πr²', '2πr', 'πd'], correct: 1, subject: 'Geometry' },
    { id: 43, text: 'In which year did the Titanic sink?', options: ['1910', '1911', '1912', '1913'], correct: 2, subject: 'History' },
    { id: 44, text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'], correct: 2, subject: 'Biology' },
    { id: 45, text: 'How many sides does a pentagon have?', options: ['4', '5', '6', '7'], correct: 1, subject: 'Geometry' },
    { id: 46, text: 'What is the value of π (pi) approximately?', options: ['2.14', '3.14', '4.14', '5.14'], correct: 1, subject: 'Mathematics' },
    { id: 47, text: 'Which programming language is known for web development?', options: ['Python', 'Java', 'JavaScript', 'C++'], correct: 2, subject: 'Computer Science' },
    { id: 48, text: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1, subject: 'Geography' },
    { id: 49, text: 'How many minutes are in 2.5 hours?', options: ['120', '130', '140', '150'], correct: 3, subject: 'Mathematics' },
    { id: 50, text: 'What force keeps us on the ground?', options: ['Magnetism', 'Electricity', 'Gravity', 'Friction'], correct: 2, subject: 'Physics' }
]

// Utility function to randomly select N questions from the pool
function getRandomQuestions(pool: Question[], count: number): Question[] {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

export function MiniExam() {
    // Generate 3 random questions on initial load or reset
    const [selectedQuestions, setSelectedQuestions] = useState(() => getRandomQuestions(QUESTION_POOL, 3))
    const [hasStarted, setHasStarted] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [score, setScore] = useState(0)
    const [completed, setCompleted] = useState(false)

    const handleSelect = (index: number) => {
        if (selectedOption !== null) return

        const currentQuestion = selectedQuestions[currentIndex]
        if (!currentQuestion) return

        setSelectedOption(index)

        const correct = index === currentQuestion.correct
        setIsCorrect(correct)

        if (correct) setScore(s => s + 1)

        setTimeout(() => {
            if (currentIndex < selectedQuestions.length - 1) {
                setCurrentIndex(c => c + 1)
                setSelectedOption(null)
                setIsCorrect(null)
            } else {
                setCompleted(true)
            }
        }, 1200)
    }

    const resetExam = () => {
        // Generate new random questions and reset all state
        setSelectedQuestions(getRandomQuestions(QUESTION_POOL, 3))
        setHasStarted(false)
        setCurrentIndex(0)
        setScore(0)
        setCompleted(false)
        setSelectedOption(null)
        setIsCorrect(null)
    }

    if (!hasStarted) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col relative overflow-hidden bg-slate-50 dark:bg-[#0A0A0C]"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" />

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl shadow-xl flex items-center justify-center mb-6 border border-slate-100 dark:border-white/10">
                        <Play className="w-8 h-8 text-[#7C3AED] ml-1" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        Ready to Start?
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[200px]">
                        Take a quick 3-question demo to see how our AI exam engine works.
                    </p>

                    <button
                        onClick={() => setHasStarted(true)}
                        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-violet-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Start Demo Exam</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>~1 Minute</span>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (completed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#0A0A0C]"
            >
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                    <Award className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Great Job!</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    You scored <span className="font-bold text-slate-900 dark:text-white">{score}/{selectedQuestions.length}</span> correct answers.
                </p>

                <div className="w-full bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        <span>Accuracy</span>
                        <span>{Math.round((score / selectedQuestions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(score / selectedQuestions.length) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-green-500 rounded-full"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={resetExam}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white py-3 px-6 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/register'}
                        className="w-full bg-[#7C3AED] text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:bg-[#6D28D9] transition-colors"
                    >
                        Get Full Access
                    </button>
                </div>
            </motion.div>
        )
    }

    const currentQuestion = selectedQuestions[currentIndex]
    if (!currentQuestion) return null

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0A0A0C] font-sans relative">
            <div className="px-5 py-4 bg-white/80 dark:bg-[#111114]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex justify-between items-center z-10 sticky top-0">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{currentQuestion.subject}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Question {currentIndex + 1}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <Clock className="w-4 h-4 text-slate-400" />
                </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pb-20"
                    >
                        <div className="bg-white dark:bg-[#111114] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                                {currentQuestion.text}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = selectedOption === idx
                                const isCorrectOption = idx === currentQuestion.correct

                                let containerClasses = "group relative w-full p-4 rounded-xl text-left border-2 transition-all duration-200 outline-none "
                                let bgClasses = "bg-white dark:bg-[#111114] border-slate-200 dark:border-white/5 hover:border-violet-300 dark:hover:border-violet-700 "
                                let textClasses = "text-slate-600 dark:text-slate-300 font-medium "
                                let icon = null

                                if (selectedOption !== null) {
                                    if (isSelected) {
                                        if (isCorrect) {
                                            bgClasses = "bg-green-50 dark:bg-green-900/20 border-green-500 "
                                            textClasses = "text-green-700 dark:text-green-400 "
                                            icon = <Check className="w-5 h-5 text-green-500" />
                                        } else {
                                            bgClasses = "bg-red-50 dark:bg-red-900/20 border-red-500 "
                                            textClasses = "text-red-700 dark:text-red-400 "
                                            icon = <X className="w-5 h-5 text-red-500" />
                                        }
                                    } else if (isCorrectOption) {
                                        bgClasses = "bg-green-50 dark:bg-green-900/20 border-green-500 opacity-70 "
                                    } else {
                                        bgClasses = "opacity-50 "
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={selectedOption !== null}
                                        onClick={() => handleSelect(idx)}
                                        className={containerClasses + bgClasses + "active:scale-[0.98] flex items-center justify-between"}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${isSelected
                                                ? isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={textClasses}>{option}</span>
                                        </div>
                                        {icon}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-[#111114] p-4 border-t border-slate-200 dark:border-white/5 z-20">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Progress</span>
                    <span>{currentIndex + 1} / {selectedQuestions.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#7C3AED]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / selectedQuestions.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
