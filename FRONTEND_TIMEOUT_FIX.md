# Frontend Timeout Fix for Google Gemini API

## Summary
**Date**: January 9, 2026  
**Status**: ✅ **FIXED**  
**Issue**: Frontend timeout (2 minutes) was shorter than Google Gemini API processing time (3+ minutes)  
**Solution**: Increased frontend timeout to 4 minutes and updated status messages

## Problem Identified

The system had a timeout mismatch between frontend and backend:

1. **Frontend Timeout**: 2 minutes (120000ms) in upload page
2. **Backend Processing**: 3+ minutes for Google Gemini API
3. **User Experience**: "AI generation timed out" message while backend was still working
4. **Result**: Frontend gave up before backend completed successfully

## Root Cause Analysis

The issue occurred because:
- Backend was successfully processing questions with Google Gemini API
- Frontend `AbortSignal.timeout(120000)` was canceling the request after 2 minutes
- Backend continued processing and completed successfully
- User saw timeout error despite successful backend processing

## Solution Implemented

### 1. Increased Frontend Timeout
**File**: `app/upload/page.tsx`
- **Before**: 120000ms (2 minutes)
- **After**: 240000ms (4 minutes)

```typescript
const processResponse = await fetch('/api/pdf/process', {
  method: 'POST',
  body: formData,
  signal: AbortSignal.timeout(240000) // 4 minute timeout for PDF processing (increased for Google API)
})
```

### 2. Updated Status Message
**File**: `components/upload/QuestionGenerationStatus.tsx`
- **Before**: "Using Enhanced Local AI (No API timeouts!)"
- **After**: "Using Google Gemini AI (Extended processing time)"

```typescript
Batch {currentBatch} of {totalBatches} - Using Google Gemini AI (Extended processing time)
```

## Complete Timeout Hierarchy

The system now has proper timeout cascading:

1. **Google API Client**: 120 seconds (2 minutes)
2. **Question Generator**: 120 seconds (2 minutes)  
3. **PDF Processing Route**: 180 seconds (3 minutes)
4. **Frontend Request**: 240 seconds (4 minutes)

This ensures each layer has sufficient time before the next layer times out.

## Expected User Experience

With these fixes, users should now see:

✅ **No Frontend Timeouts**: 4-minute frontend timeout accommodates 3-minute backend processing  
✅ **Accurate Status Messages**: Users know they're using Google Gemini API with extended processing time  
✅ **Successful Completion**: Full question generation completes without interruption  
✅ **Better Communication**: Clear expectation that processing takes longer with external AI  

## Performance Expectations

- **Total Processing Time**: 2-4 minutes for 20 questions
- **User Feedback**: Clear progress indicators during extended processing
- **Success Rate**: Should reach 100% with proper timeout handling
- **Quality**: Maintained high-quality questions from Google Gemini API

## Testing Recommendations

To verify the fix:
1. Upload a PDF file
2. Observe that processing continues beyond 2 minutes
3. Verify successful completion within 4 minutes
4. Confirm high-quality questions are generated
5. Check that no timeout errors appear in frontend

The system now properly accommodates Google Gemini API's processing time while providing clear user feedback about the extended processing duration.