# SSR Window Reference Fix

## Issue Fixed ✅
**Problem**: `ReferenceError: window is not defined` during server-side rendering (SSR) in Next.js
- **Root Cause**: Direct `window.innerWidth` usage in component render functions
- **Impact**: Pages crashed with 500 errors during SSR

## Solution Implemented

### ✅ **React State-Based Responsive Design**
Replaced direct `window.innerWidth` checks with proper React state management:

```typescript
// Before (❌ SSR Error)
padding: window.innerWidth < 768 ? '0 1.5rem' : '0 1.5rem'

// After (✅ SSR Safe)
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  return () => window.removeEventListener('resize', checkMobile)
}, [])

// Usage
padding: isMobile ? '0 1.5rem' : '0 1.5rem'
```

## Files Fixed

### 1. `/app/browse/page.tsx` ✅
- Added `isMobile` state with proper useEffect
- Replaced all `window.innerWidth` references
- Fixed responsive grid layouts and styling

### 2. `/app/dashboard/page.tsx` ✅  
- Added mobile state management
- Updated responsive typography and spacing
- Fixed stats card grid layout

### 3. `/app/questions/page.tsx` ✅
- Implemented mobile detection hook
- Updated header and empty state styling
- Fixed responsive button sizing

## Technical Implementation

### Mobile Detection Hook
```typescript
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  return () => window.removeEventListener('resize', checkMobile)
}, [])
```

### Benefits
- ✅ **SSR Compatible**: No window access during server rendering
- ✅ **Responsive**: Updates on window resize
- ✅ **Performance**: Single event listener per component
- ✅ **Clean**: Proper cleanup on unmount

## Alternative Approaches Considered

1. **CSS Media Queries**: Limited for complex conditional logic
2. **useMediaQuery Hook**: Would require additional dependency
3. **CSS-in-JS Libraries**: Overkill for this specific issue
4. **Tailwind Responsive Classes**: Not compatible with inline styles approach

## Result
- ✅ **No more SSR errors** - Pages load correctly
- ✅ **Maintained responsiveness** - Mobile layouts work perfectly  
- ✅ **Better performance** - Proper React lifecycle management
- ✅ **Future-proof** - Scalable pattern for other components

---

**Status**: ✅ **COMPLETE** - All SSR window reference errors have been resolved.