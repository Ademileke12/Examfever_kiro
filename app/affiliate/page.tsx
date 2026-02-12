import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard'

export default function AffiliatePage() {
    return (
        <ProtectedRoute>
            <AffiliateContent />
        </ProtectedRoute>
    )
}

function AffiliateContent() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0C] py-12 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-[#111114] py-8 px-4 md:py-12 md:px-12 shadow-xl rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/5">
                    <AffiliateDashboard />
                </div>
            </div>
        </div>
    )
}
