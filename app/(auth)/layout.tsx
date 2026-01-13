import { Navbar } from '@/components/ui/Navbar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">EF</span>
              </div>
              <span className="font-semibold text-xl text-foreground">ExamFever</span>
            </div>
          </div>
          
          <div className="glass glass-hover rounded-2xl border border-glass-border shadow-glass-dark p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
