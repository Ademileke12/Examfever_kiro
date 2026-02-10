import { Variants } from 'framer-motion'

// Page transition animations
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// Question card animations
export const questionVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  },
}

// Timer animations
export const timerVariants: Variants = {
  normal: { 
    scale: 1,
    color: 'hsl(210, 100%, 56%)',
  },
  warning: { 
    scale: [1, 1.05, 1],
    color: 'hsl(48, 100%, 50%)',
    transition: { 
      scale: { repeat: Infinity, duration: 1 },
      color: { duration: 0.3 }
    }
  },
  critical: { 
    scale: [1, 1.1, 1],
    color: 'hsl(0, 86%, 59%)',
    transition: { 
      scale: { repeat: Infinity, duration: 0.5 },
      color: { duration: 0.3 }
    }
  },
}

// Progress bar animations
export const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.5, ease: 'easeOut' }
  }),
}

// Button animations
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
}

// Modal animations
export const modalVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { 
      duration: 0.2
    }
  },
}

// List item stagger animations
export const listVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
}

export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
}

// Answer selection animations
export const answerVariants: Variants = {
  unselected: { 
    backgroundColor: 'hsl(0, 0%, 100%)',
    borderColor: 'hsl(210, 16%, 93%)',
    scale: 1
  },
  selected: { 
    backgroundColor: 'hsl(210, 100%, 97%)',
    borderColor: 'hsl(210, 100%, 56%)',
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  correct: { 
    backgroundColor: 'hsl(142, 76%, 96%)',
    borderColor: 'hsl(142, 76%, 45%)',
    scale: 1.02,
    transition: { duration: 0.3 }
  },
  incorrect: { 
    backgroundColor: 'hsl(0, 86%, 97%)',
    borderColor: 'hsl(0, 86%, 59%)',
    scale: 1.02,
    transition: { duration: 0.3 }
  },
}

// Floating action button
export const fabVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { 
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  },
  hover: { 
    scale: 1.1,
    transition: { duration: 0.2 }
  },
}

// Notification animations
export const notificationVariants: Variants = {
  initial: { 
    opacity: 0,
    y: -50,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0,
    y: -50,
    scale: 0.9,
    transition: { duration: 0.2 }
  },
}
