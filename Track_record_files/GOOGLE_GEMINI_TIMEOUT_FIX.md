# Google Gemini API Timeout Fix

## Summary
**Date**: January 9, 2026  
**Status**: ✅ **FIXED**  
**Issue**: PDF processing timeout (90s) was shorter than Google Gemini API response time  
**Solution**: Increased all timeouts to accommodate Google API response times

## Problem Identified

The system was experiencing timeout conflicts:

1. **PDF Processing Route**: 90-second timeout
2. **Google Gemini API**: Taking 90+ seconds to respond
3. **Result**: Timeout error even though API call was successful

### Error Log Analysis
```
Question generation error: Error: Question generation timeout after 90s
...
✅ Xroute Google API response received: 7038 characters
```

This showed the API was working but timing out due to insufficient timeout duration.

## Solution Implemented

### 1. Increased PDF Processing Timeout
**File**: `app/api/pdf/process/route.ts`
- **Before**: 90 seconds (90000ms)
- **After**: 180 seconds (180000ms)

```typescript
const timeoutPromise = new Promise<never>((_, reject) => {
  timeoutId = setTimeout(() => {
    reject(new Error('Question generation timeout after 180s'))
  }, 180000) // Increased to 3 minutes for Google API
})
```

### 2. Increased Google API Client Timeout
**File**: `lib/ai/xroute-google-client.ts`
- **Before**: 60 seconds (60000ms)
- **After**: 120 seconds (120000ms)

```typescript
const response = await axios.post(this.apiUrl, requestBody, { 
  headers,
  timeout: 120000 // Increased to 2 minutes timeout
})
```

### 3. Updated Question Generator Timeout
**File**: `lib/ai/question-generator.ts`
- **Before**: 60 seconds for Xroute
- **After**: 120 seconds for Xroute

```typescript
const timeoutDuration = model.type === 'xroute' ? 120000 : model.type === 'fireworks' ? 20000 : 30000
```

## Timeout Hierarchy

The new timeout structure ensures proper cascading:

1. **Google API Client**: 120 seconds (2 minutes)
2. **Question Generator**: 120 seconds (2 minutes)  
3. **PDF Processing Route**: 180 seconds (3 minutes)

This gives the Google API enough time to respond while maintaining reasonable upper limits.

## Expected Results

With these changes, the system should:

✅ **No More Timeouts**: Google API has sufficient time to respond  
✅ **Successful Processing**: Complete question generation without interruption  
✅ **Better User Experience**: No false timeout errors  
✅ **Maintained Performance**: Still reasonable limits to prevent hanging  

## Performance Expectations

- **Google Gemini API**: 60-120 seconds per batch
- **Total Processing**: 2-3 minutes for 20 questions
- **Success Rate**: Should reach 100% with proper timeout handling

The system now accommodates the Google Gemini API's response time while maintaining robust error handling and reasonable timeout limits.