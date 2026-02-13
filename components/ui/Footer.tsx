'use client'

import Link from 'next/link'
import { Logo } from './Logo'

export function Footer() {
    return (
        <footer className="py-12 px-6">
            <div className="max-w-7xl mx-auto border-t dark:border-white/5 pt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Branding */}
                    <div className="flex items-center gap-2 scale-90 origin-left">
                        <Logo />
                    </div>

                    {/* Links */}
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-8 gap-y-4">
                        <Link href="/affiliate" className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors">
                            Affiliate Program
                        </Link>
                        <Link href="/privacy" className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/contact" className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] transition-colors">
                            Contact Support
                        </Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                        © 2026 ExamFever AI. World-class learning.
                    </p>
                </div>
            </div>
        </footer>
    )
}
