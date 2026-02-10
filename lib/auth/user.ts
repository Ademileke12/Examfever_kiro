// Simple user management utility
// In a real app, this would integrate with your auth system

export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'demo-user' // Server-side fallback
  }
  
  // Try to get from localStorage first
  let userId = localStorage.getItem('userId')
  
  if (!userId) {
    // Generate a simple user ID if none exists
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('userId', userId)
  }
  
  return userId
}

export function setUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userId', userId)
  }
}

export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId')
  }
}