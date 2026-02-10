// Semantic color definitions for light and dark themes
export const colors = {
  // Primary brand colors
  primary: {
    50: 'hsl(210, 100%, 97%)',
    100: 'hsl(210, 100%, 94%)',
    200: 'hsl(210, 100%, 87%)',
    300: 'hsl(210, 100%, 78%)',
    400: 'hsl(210, 100%, 66%)',
    500: 'hsl(210, 100%, 56%)', // Main brand color
    600: 'hsl(210, 100%, 47%)',
    700: 'hsl(210, 100%, 39%)',
    800: 'hsl(210, 100%, 31%)',
    900: 'hsl(210, 100%, 24%)',
  },

  // Success colors (for correct answers, achievements)
  success: {
    50: 'hsl(142, 76%, 96%)',
    100: 'hsl(142, 76%, 91%)',
    200: 'hsl(142, 76%, 81%)',
    300: 'hsl(142, 76%, 69%)',
    400: 'hsl(142, 76%, 53%)',
    500: 'hsl(142, 76%, 45%)', // Main success color
    600: 'hsl(142, 76%, 37%)',
    700: 'hsl(142, 76%, 29%)',
    800: 'hsl(142, 76%, 24%)',
    900: 'hsl(142, 76%, 20%)',
  },

  // Warning colors (for time warnings, cautions)
  warning: {
    50: 'hsl(48, 100%, 96%)',
    100: 'hsl(48, 100%, 88%)',
    200: 'hsl(48, 100%, 76%)',
    300: 'hsl(48, 100%, 64%)',
    400: 'hsl(48, 100%, 53%)',
    500: 'hsl(48, 100%, 50%)', // Main warning color
    600: 'hsl(48, 100%, 42%)',
    700: 'hsl(48, 100%, 34%)',
    800: 'hsl(48, 100%, 27%)',
    900: 'hsl(48, 100%, 20%)',
  },

  // Error colors (for incorrect answers, errors)
  error: {
    50: 'hsl(0, 86%, 97%)',
    100: 'hsl(0, 86%, 94%)',
    200: 'hsl(0, 86%, 86%)',
    300: 'hsl(0, 86%, 77%)',
    400: 'hsl(0, 86%, 65%)',
    500: 'hsl(0, 86%, 59%)', // Main error color
    600: 'hsl(0, 86%, 50%)',
    700: 'hsl(0, 86%, 42%)',
    800: 'hsl(0, 86%, 35%)',
    900: 'hsl(0, 86%, 29%)',
  },

  // Neutral colors for backgrounds and text
  neutral: {
    50: 'hsl(210, 20%, 98%)',
    100: 'hsl(210, 20%, 95%)',
    200: 'hsl(210, 16%, 93%)',
    300: 'hsl(210, 14%, 89%)',
    400: 'hsl(210, 14%, 83%)',
    500: 'hsl(210, 11%, 71%)',
    600: 'hsl(210, 7%, 56%)',
    700: 'hsl(210, 9%, 31%)',
    800: 'hsl(210, 10%, 23%)',
    900: 'hsl(210, 11%, 15%)',
  },
}

// Exam-specific color mappings
export const examColors = {
  // Question states
  unanswered: colors.neutral[300],
  answered: colors.primary[500],
  flagged: colors.warning[500],
  current: colors.primary[600],

  // Timer states
  timerNormal: colors.primary[500],
  timerWarning: colors.warning[500],
  timerCritical: colors.error[500],

  // Progress states
  progressComplete: colors.success[500],
  progressCurrent: colors.primary[500],
  progressRemaining: colors.neutral[300],
}

// Accessibility-compliant color combinations
export const accessibleCombinations = {
  light: {
    background: colors.neutral[50],
    surface: 'hsl(0, 0%, 100%)',
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    border: colors.neutral[200],
  },
  dark: {
    background: colors.neutral[900],
    surface: colors.neutral[800],
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    border: colors.neutral[700],
  },
}

// Animation-friendly color utilities
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => {
    return color.replace('hsl(', `hsla(`).replace(')', `, ${opacity})`)
  },

  // Get hover variant (slightly darker/lighter)
  getHoverVariant: (color: string, theme: 'light' | 'dark' = 'light') => {
    // Simple hover effect by adjusting lightness
    return theme === 'light' 
      ? color.replace(/(\d+)%\)$/, (match, lightness) => `${Math.max(0, parseInt(lightness) - 5)}%)`)
      : color.replace(/(\d+)%\)$/, (match, lightness) => `${Math.min(100, parseInt(lightness) + 5)}%)`)
  },
}
