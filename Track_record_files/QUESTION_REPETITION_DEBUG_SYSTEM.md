# Question Repetition Debug System

## Overview
Comprehensive debugging system to identify, analyze, and eliminate question repetition issues in the AI question generation process.

## 🔧 Debug Tools Created

### 1. Debug API Endpoint
**Location**: `/api/debug-question-generation`

**Features**:
- Detailed question generation analysis
- Similarity comparison between all generated questions
- Pattern analysis for duplicate detection
- Question stem analysis
- Comprehensive logging and metrics

**Usage**:
```bash
POST /api/debug-question-generation
{
  "content": "Your test content here",
  "maxQuestions": 15
}
```

### 2. Debug Interface
**Location**: `/debug-questions`

**Features**:
- Interactive testing interface
- Sample content loading
- Real-time duplicate analysis
- Visual similarity reporting
- Pattern and stem duplicate detection

**Access**: Navigate to `http://localhost:3001/debug-questions`

## 🔍 Enhanced Deduplication System

### 1. Stricter Similarity Threshold
- **Previous**: 80% similarity threshold
- **Current**: 65% similarity threshold
- **Impact**: Catches more subtle duplicates

### 2. Semantic Similarity Detection
**New Features**:
- Key concept extraction from questions
- Question intent analysis
- Pattern matching for similar question structures
- Subject similarity comparison

**Algorithm**:
```typescript
// Combines multiple similarity metrics
const maxSimilarity = Math.max(
  textSimilarity,      // Traditional text similarity
  semanticSimilarity   // New semantic analysis
)
```

### 3. Enhanced Logging
**Console Output**:
```
🔍 DEDUPLICATION ANALYSIS:
Before deduplication: 15 questions
Q1: "What is the primary function of React components..." (multiple-choice, medium)
Q2: "How does the Virtual DOM improve performance..." (short-answer, hard)
...
🚨 DUPLICATE DETECTED: 72.3% similarity
  Original: "What is the primary function of React components..."
  Duplicate: "What is the main purpose of React components..."
✅ UNIQUE: "How does JSX syntax work in React applications..." (multiple-choice, easy)
🎯 Deduplication complete: 12 unique questions, 3 duplicates removed
```

## 📊 Debug Analysis Features

### 1. Similarity Analysis
- **High Similarity Pairs**: >65% similarity (potential duplicates)
- **Medium Similarity Pairs**: 40-65% similarity (watch list)
- **Detailed Comparison**: Question text, type, difficulty comparison

### 2. Pattern Analysis
- **Key Word Patterns**: Groups questions by similar word patterns
- **Duplicate Detection**: Identifies questions with identical key concepts
- **Pattern Frequency**: Shows how many questions share similar patterns

### 3. Question Stem Analysis
- **Stem Extraction**: First 30 characters of each question
- **Duplicate Stems**: Questions starting with identical text
- **Stem Frequency**: Count of questions with same beginning

### 4. Diversity Scoring
- **Batch Diversity**: Measures uniqueness within question batches
- **Threshold Enforcement**: Rejects batches below 70% diversity
- **Model Fallback**: Tries next AI model if diversity is insufficient

## 🚀 How to Debug Question Repetition

### Step 1: Use the Debug Interface
1. Navigate to `/debug-questions`
2. Load sample content or paste your own
3. Set desired question count
4. Click "Test Question Generation"

### Step 2: Analyze Results
**Look for**:
- High similarity pairs (>65%)
- Duplicate patterns in key words
- Repeated question stems
- Low diversity scores

### Step 3: Identify Root Causes
**Common Issues**:
- AI model generating similar question structures
- Limited content diversity leading to repeated concepts
- Insufficient prompting for question variety
- Weak deduplication thresholds

### Step 4: Apply Fixes
**Solutions**:
- Adjust similarity thresholds
- Improve AI prompting for diversity
- Use different content sections for each batch
- Implement semantic similarity checks

## 🔧 Technical Implementation

### Enhanced Deduplication Algorithm
```typescript
// Multi-layered duplicate detection
for (const question of questions) {
  for (const existingQuestion of uniqueQuestions) {
    // Traditional similarity
    const textSimilarity = calculateQuestionSimilarity(question, existingQuestion)
    
    // New semantic similarity
    const semanticSimilarity = calculateSemanticSimilarity(question, existingQuestion)
    
    // Use highest similarity score
    const maxSimilarity = Math.max(textSimilarity, semanticSimilarity)
    
    if (maxSimilarity > SIMILARITY_THRESHOLD) {
      // Mark as duplicate
    }
  }
}
```

### Semantic Analysis Components
1. **Key Concept Extraction**: Removes question words, extracts meaningful terms
2. **Concept Overlap**: Calculates Jaccard similarity of key concepts
3. **Intent Similarity**: Analyzes question patterns and subjects
4. **Pattern Matching**: Identifies similar question structures

### Diversity Validation
```typescript
// Real-time diversity scoring
const diversityScore = calculateBatchDiversity(questions)
if (diversityScore < 0.7) {
  console.warn('Low diversity detected, trying next AI model')
  continue // Try next model
}
```

## 📈 Expected Improvements

### Before Debug System
- Hidden duplicate issues
- No visibility into similarity patterns
- Manual duplicate detection
- Inconsistent question quality

### After Debug System
- **Real-time Analysis**: Immediate duplicate detection
- **Pattern Recognition**: Identifies subtle similarities
- **Quality Metrics**: Diversity scoring and validation
- **Comprehensive Logging**: Detailed generation insights
- **Proactive Prevention**: Rejects low-diversity batches

## 🎯 Usage Instructions

### For Development
1. **Test New Content**: Use debug interface to test question generation
2. **Monitor Logs**: Check console for deduplication analysis
3. **Adjust Thresholds**: Modify similarity thresholds based on results
4. **Validate Changes**: Ensure improvements reduce duplicates

### For Production Monitoring
1. **Console Logging**: Monitor deduplication statistics
2. **Diversity Scores**: Track batch diversity metrics
3. **Duplicate Counts**: Monitor removed duplicate counts
4. **Model Performance**: Track which AI models perform best

## 🔍 Debug Checklist

When investigating question repetition:

- [ ] Check console logs for deduplication analysis
- [ ] Use debug interface to test specific content
- [ ] Analyze similarity patterns in generated questions
- [ ] Verify diversity scores are above 70%
- [ ] Confirm semantic similarity detection is working
- [ ] Test with different AI models
- [ ] Validate content sectioning is creating variety
- [ ] Check that enhanced prompting is being used

## 📊 Success Metrics

Monitor these indicators:
- **Reduced Duplicate Count**: Fewer questions removed by deduplication
- **Higher Diversity Scores**: Batch diversity consistently >70%
- **Better User Feedback**: Fewer complaints about repeated questions
- **Improved Question Quality**: More varied question types and focuses

The debug system provides comprehensive tools to identify, analyze, and eliminate question repetition issues, ensuring users receive truly unique and diverse questions for their exams.