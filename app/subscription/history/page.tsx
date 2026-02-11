'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, History, FileText, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
    id: string
    reference: string
    amount: number
    status: string
    plan_tier: string
    created_at: string
    metadata: any
}

export default function BillingHistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { data, error } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setTransactions(data)
            }
            setLoading(false)
        }

        fetchHistory()
    }, [])

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
                <ParticleBackground />
                <Navbar />

                <div className="relative z-10 pt-32 px-4 max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/subscription" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-readable" />
                        </Link>
                        <h1 className="text-3xl font-black gradient-text flex items-center gap-3">
                            <History className="w-8 h-8 text-primary" />
                            Billing History
                        </h1>
                    </div>

                    <div className="glass rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-20 text-readable-muted">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No payment history found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-readable-muted text-sm uppercase tracking-wider">
                                            <th className="py-4 px-4 font-semibold">Date</th>
                                            <th className="py-4 px-4 font-semibold">Description</th>
                                            <th className="py-4 px-4 font-semibold">Reference</th>
                                            <th className="py-4 px-4 font-semibold">Amount</th>
                                            <th className="py-4 px-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-readable">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 font-medium capitalize">
                                                    {tx.plan_tier.replace('-', ' ')}
                                                </td>
                                                <td className="py-4 px-4 font-mono text-xs opacity-70">
                                                    {tx.reference.substring(0, 10)}...
                                                </td>
                                                <td className="py-4 px-4 font-bold">
                                                    ₦{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${tx.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                                        }`}>
                                                        {tx.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
