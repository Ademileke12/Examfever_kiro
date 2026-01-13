'use client'

export default function TestColorsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Text Color Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original problematic colors */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Original Colors (Problematic)</h2>
            <div className="space-y-2">
              <p className="text-slate-600 dark:text-slate-300">text-slate-600 dark:text-slate-300</p>
              <p className="text-slate-400 dark:text-slate-400">text-slate-400 dark:text-slate-400</p>
              <p className="text-slate-300 dark:text-slate-300">text-slate-300 dark:text-slate-300</p>
              <p className="text-muted-foreground">text-muted-foreground</p>
            </div>
          </div>

          {/* Fixed colors */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Fixed Colors</h2>
            <div className="space-y-2">
              <p className="text-readable">text-readable (Primary text)</p>
              <p className="text-readable-muted">text-readable-muted (Secondary text)</p>
              <p className="text-readable-light">text-readable-light (Muted text)</p>
              <p className="text-contrast">text-contrast</p>
              <p className="text-contrast-muted">text-contrast-muted</p>
            </div>
          </div>
        </div>

        {/* Color swatches */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Color Swatches</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card border rounded-lg">
              <div className="w-full h-12 bg-foreground rounded mb-2"></div>
              <p className="text-sm text-foreground">Foreground</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <div className="w-full h-12 bg-muted-foreground rounded mb-2"></div>
              <p className="text-sm text-foreground">Muted Foreground</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <div className="w-full h-12 bg-primary rounded mb-2"></div>
              <p className="text-sm text-foreground">Primary</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <div className="w-full h-12 bg-secondary rounded mb-2"></div>
              <p className="text-sm text-foreground">Secondary</p>
            </div>
          </div>
        </div>

        {/* Test cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Test Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-readable mb-2">Card Title</h3>
              <p className="text-readable-muted mb-4">This is secondary text that should be readable in both light and dark modes.</p>
              <p className="text-readable-light">This is muted text for less important information.</p>
            </div>
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Card with CSS Variables</h3>
              <p className="text-muted-foreground mb-4">This uses CSS variables for theming.</p>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                Primary Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}