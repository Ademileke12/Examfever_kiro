# AI Prompt Templates - Complete Documentation

## Overview
Comprehensive documentation of all AI prompt templates used in the ExamFever Simulator for question generation, content analysis, and validation.

## 🎯 Enhanced Question Generation Prompts

### 1. Base System Prompt (Enhanced for Diversity)
```typescript
const baseSystem = `You are an expert educational content creator specializing in generating high-quality, UNIQUE exam questions. Your primary goal is to create diverse questions that test different aspects of the content without repetition.

CRITICAL REQUIREMENTS FOR UNIQUENESS:
- Each question MUST focus on a different concept, detail, or aspect of the content
- Vary question stems and approaches (What, How, Why, When, Where, Which, etc.)
- Test different cognitive levels: recall, understanding, application, analysis
- Use different parts of the content for each question
- Avoid similar phrasing or question structures
- Ensure each question has a distinct focus and purpose

QUALITY GUIDELINES:
- Questions must be directly relevant to the provided content
- Use clear, unambiguous language
- For multiple-choice questions, provide 4 options with only one correct answer
- Include brief explanations for correct answers
- Focus on key concepts and important details
- Test understanding, not just memorization

DIFFICULTY LEVEL: ${difficulty}
- Easy: Basic facts, definitions, simple recall
- Medium: Understanding relationships, applying concepts
- Hard: Analysis, synthesis, evaluation, complex reasoning`
```

### 2. Multiple Choice Template (Enhanced)
```typescript
user: `Based on the following content, generate ${maxQuestions} UNIQUE multiple-choice questions at ${difficulty} difficulty level.

DIVERSITY REQUIREMENTS:
- Question 1: Focus on a main concept or definition
- Question 2: Test understanding of a process or relationship  
- Question 3: Apply knowledge to a specific example or scenario
- Question 4: Analyze cause-and-effect or compare/contrast
- Question 5: Evaluate or synthesize information from different parts

Use different question stems:
- "What is the primary..." / "Which of the following best describes..."
- "How does... affect..." / "What happens when..."
- "In the context of..., which..." / "According to the content..."
- "Why is... important for..." / "What would result if..."
- "Which statement about... is most accurate?"

Content:
${content}

THINK STEP BY STEP:
1. Identify 5 different key concepts/topics from the content
2. Choose different cognitive levels for each question
3. Use varied question structures and stems
4. Ensure each question tests a unique aspect

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": [
      {"text": "Option A", "correct": false},
      {"text": "Option B", "correct": true},
      {"text": "Option C", "correct": false},
      {"text": "Option D", "correct": false}
    ],
    "explanation": "Brief explanation of why the correct answer is right",
    "topic": "Main topic/concept being tested",
    "keywords": ["keyword1", "keyword2"],
    "cognitive_level": "recall|understanding|application|analysis|evaluation"
  }
]`
```

### 3. Short Answer Template (Enhanced)
```typescript
user: `Based on the following content, generate ${maxQuestions} UNIQUE short-answer questions at ${difficulty} difficulty level.

DIVERSITY REQUIREMENTS:
- Use different question types: Explain, Describe, Compare, Analyze, Evaluate
- Focus on different aspects: definitions, processes, relationships, applications, implications
- Vary the scope: specific details, broad concepts, connections between ideas
- Test different skills: recall, comprehension, application, analysis

Question stem variations:
- "Explain how/why..." / "Describe the process of..."
- "Compare and contrast..." / "What are the key differences between..."
- "Analyze the relationship between..." / "What factors contribute to..."
- "Evaluate the importance of..." / "What would happen if..."
- "Summarize the main points about..." / "Identify the key characteristics of..."

Content:
${content}

THINK STEP BY STEP:
1. Identify 5 different aspects of the content to question
2. Choose different question types (explain, describe, compare, etc.)
3. Vary the cognitive complexity for each question
4. Ensure each question requires a different type of response

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "answer": "Expected answer (2-3 sentences)",
    "keywords": ["keyword1", "keyword2"],
    "topic": "Main topic/concept being tested",
    "cognitive_level": "recall|understanding|application|analysis|evaluation",
    "question_type": "explain|describe|compare|analyze|evaluate"
  }
]`
```

### 4. Mixed Question Batch Prompt (Ultra-Diversity Focused)
```typescript
createDiversityFocusedPrompt: `You are an expert educational content creator. Generate ${batchSize} COMPLETELY UNIQUE and DIVERSE exam questions from the content below.

MANDATORY DIVERSITY REQUIREMENTS:
🎯 Each question MUST test a different concept, process, or detail from the content
🎯 Use different question stems: "What is...", "How does...", "Why is...", "Which of...", "When does...", "Where can..."
🎯 Test different cognitive levels: recall, understanding, application, analysis, evaluation
🎯 Focus on different content areas: definitions, processes, examples, relationships, causes, effects
🎯 Vary question complexity and scope

CONTENT ANALYSIS STRATEGY:
1. Identify ${batchSize} distinct topics/concepts in the content
2. Choose different aspects to test for each (definition, function, importance, process, etc.)
3. Use varied question structures and approaches
4. Ensure each question requires different knowledge/skills

Content:
${content}

QUALITY CHECKLIST:
✅ Each question focuses on a unique aspect of the content
✅ No similar phrasing or question structures
✅ Different cognitive demands for each question
✅ Varied difficulty levels: ${difficulties.join(', ')}
✅ Mixed question types: ${questionTypes.join(', ')}

Generate exactly ${batchSize} questions in JSON format. Each question must be completely different from the others.

[
  {
    "type": "multiple-choice",
    "difficulty": "medium",
    "question": "Unique question text?",
    "options": [
      {"text": "Option A", "correct": false},
      {"text": "Option B", "correct": true},
      {"text": "Option C", "correct": false},
      {"text": "Option D", "correct": false}
    ],
    "explanation": "Why this answer is correct",
    "topic": "Specific topic tested",
    "keywords": ["keyword1", "keyword2"],
    "cognitive_level": "understanding",
    "content_focus": "What specific aspect this tests"
  }
]

CRITICAL: Make each question completely unique - no repetition or similarity allowed!`
```

## 🔍 Content Analysis Prompts

### 1. Content Analysis Template
```typescript
getContentAnalysisPrompt: `You are an expert content analyzer. Analyze the provided educational content and extract key information about topics, concepts, and appropriate difficulty levels.

Analyze the following content and provide a JSON response with this structure:

Content:
${content}

{
  "topics": ["main topic 1", "main topic 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "concepts": ["concept1", "concept2"],
  "difficulty": "easy|medium|hard",
  "contentType": "academic|technical|general",
  "suggestedQuestionTypes": ["multiple-choice", "short-answer", "essay"]
}`
```

### 2. Question Validation Template
```typescript
getQuestionValidationPrompt: `You are an expert educational content reviewer. Evaluate the quality of the provided question and provide detailed feedback.

Evaluate this ${questionType} question and provide a JSON response:

Question: ${question}

{
  "score": 0.85,
  "issues": [
    {
      "type": "clarity|grammar|relevance|difficulty|structure",
      "severity": "low|medium|high",
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "strengths": ["What works well about this question"],
  "suggestions": ["How to improve the question"]
}`
```

## 🚀 Advanced Prompting Strategies

### 1. Content Sectioning Strategy
```typescript
// Split content into logical sections for diverse question generation
private splitContentIntoSections(content: string): string[] {
  // Try to split by paragraphs first
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 100)
  
  if (paragraphs.length >= 3) {
    return paragraphs // Use paragraphs as sections
  } else {
    // Split by sentences into chunks
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 50)
    const chunkSize = Math.ceil(sentences.length / 3)
    // Create 3 sections from sentences
  }
}
```

### 2. Cognitive Level Distribution
```typescript
// Ensure questions test different cognitive levels
const cognitiveDistribution = {
  easy: ['recall', 'understanding'],
  medium: ['understanding', 'application', 'analysis'],
  hard: ['analysis', 'evaluation', 'synthesis']
}
```

### 3. Question Stem Variations
```typescript
const questionStems = {
  recall: ['What is...', 'Define...', 'List...', 'Identify...'],
  understanding: ['Explain...', 'Describe...', 'Summarize...', 'Interpret...'],
  application: ['Apply...', 'Use...', 'Demonstrate...', 'Solve...'],
  analysis: ['Analyze...', 'Compare...', 'Contrast...', 'Examine...'],
  evaluation: ['Evaluate...', 'Judge...', 'Critique...', 'Assess...'],
  synthesis: ['Create...', 'Design...', 'Formulate...', 'Construct...']
}
```

## 🎯 Diversity Enforcement Techniques

### 1. Pre-Generation Analysis
```typescript
// Analyze content before generation to ensure diversity
const contentAnalysis = {
  keyTopics: extractKeyTopics(content),
  concepts: extractConcepts(content),
  processes: extractProcesses(content),
  examples: extractExamples(content),
  relationships: extractRelationships(content)
}
```

### 2. Real-Time Diversity Validation
```typescript
// Validate diversity during generation
const diversityScore = calculateBatchDiversity(questions)
if (diversityScore < 0.7) {
  console.warn('Low diversity detected, trying next AI model')
  continue // Try next model
}
```

### 3. Semantic Similarity Prevention
```typescript
// Check for semantic duplicates
const semanticSimilarity = calculateSemanticSimilarity(q1, q2)
const maxSimilarity = Math.max(textSimilarity, semanticSimilarity)

if (maxSimilarity > SIMILARITY_THRESHOLD) {
  // Mark as duplicate
}
```

## 📊 Prompt Performance Metrics

### 1. Success Indicators
- **Diversity Score**: >70% for question batches
- **Uniqueness Rate**: <5% duplicates after deduplication
- **Cognitive Distribution**: Balanced across levels
- **Question Quality**: >0.8 average quality score

### 2. Failure Patterns
- **High Similarity**: >65% similarity between questions
- **Repeated Stems**: Same question beginnings
- **Limited Scope**: All questions from same content section
- **Single Cognitive Level**: No variety in thinking skills

## 🔧 Implementation Best Practices

### 1. Prompt Engineering Guidelines
- **Be Specific**: Clear, detailed instructions
- **Use Examples**: Show desired output format
- **Enforce Constraints**: Mandatory diversity requirements
- **Provide Structure**: Step-by-step thinking process

### 2. Quality Assurance
- **Multi-Model Testing**: Try different AI models
- **Diversity Validation**: Real-time uniqueness checking
- **Semantic Analysis**: Detect meaning-based duplicates
- **Continuous Monitoring**: Track performance metrics

### 3. Iterative Improvement
- **A/B Testing**: Compare prompt variations
- **Performance Analysis**: Monitor success rates
- **User Feedback**: Incorporate quality reports
- **Continuous Refinement**: Update based on results

## 📈 Evolution of Prompts

### Version 1.0 (Basic)
- Simple question generation
- Basic format requirements
- No diversity enforcement

### Version 2.0 (Enhanced)
- Added diversity requirements
- Cognitive level specification
- Quality guidelines

### Version 3.0 (Ultra-Diversity)
- Mandatory uniqueness requirements
- Step-by-step thinking process
- Real-time validation
- Semantic similarity prevention

### Version 4.0 (Current)
- Content sectioning strategy
- Multi-model fallback
- Comprehensive logging
- Advanced deduplication

## 🔄 Enhanced Local Generation Prompts

### 1. Enhanced Local Question Generation (Fallback System)
```typescript
generateEnhancedLocalQuestions: `Using enhanced local question generation for ${batchSize} questions...

CONTENT ANALYSIS STRATEGY:
- Advanced content analysis for intelligent question generation
- Extract key terms, excluding common words
- Identify technical patterns (numbers, formulas, definitions, processes)
- Determine content type (mathematical, scientific, procedural, theoretical, historical)
- Generate contextual question templates based on content analysis

QUESTION GENERATION APPROACH:
1. Analyze content type and extract meaningful terms
2. Create context-aware question stems based on content type
3. Generate intelligent distractors for multiple choice questions
4. Provide comprehensive answers for short answer questions
5. Ensure variety in question focus and cognitive levels

CONTENT TYPE TEMPLATES:
- Mathematical: "According to the mathematical principles discussed..."
- Scientific: "According to the scientific method described..."
- Procedural: "In the process outlined..."
- Theoretical: "According to the theoretical framework..."
- Historical: "In the historical context described..."
- General: "According to the content..."

QUALITY ASSURANCE:
- Intelligent subject pattern recognition (10+ subjects supported)
- Context-aware answer generation based on content analysis
- Sophisticated content analysis with term extraction and relationship mapping
- Enhanced fallback generation maintains professional quality standards`
```

### 2. Mock Question Generation Templates (Emergency Fallback)
```typescript
generateMockQuestionBatch: `Generating ${batchSize} enhanced offline questions as fallback...

ENHANCED CONTENT ANALYSIS:
- Extract meaningful content for better questions
- Identify sentences (>30 chars) and key terms (>4 chars, unique)
- Create contextual questions based on content analysis
- Use varied question templates for diversity

QUESTION TEMPLATES:
Multiple Choice:
- "Based on the content, what is the primary focus of..."
- "According to the material, which statement about..."
- "The content suggests that..."
- "What can be inferred about..."
- "Which of the following best describes..."

Short Answer:
- "Explain the main concept of..."
- "Describe the significance of..."
- "What are the key points regarding..."
- "Summarize the information about..."
- "Analyze the relationship between..."

QUALITY FEATURES:
- Increased minimum questions from 3 to 6
- Contextual question creation using extracted terms
- Intelligent answer generation based on content analysis
- Professional fallback maintaining user experience quality`
```

## 🎯 Advanced Debugging and Analysis Prompts

### 1. Debug Question Generation API
```typescript
debugQuestionGeneration: `🔍 DEBUGGING QUESTION GENERATION

COMPREHENSIVE ANALYSIS:
- Content length and processing validation
- AI model performance and response analysis
- Question parsing and format validation
- Duplicate detection and similarity analysis
- Pattern analysis for repeated question structures
- Stem analysis for question beginning similarities

DUPLICATE ANALYSIS FEATURES:
- Compare each question against every other question
- Calculate similarity scores with detailed reporting
- Identify high similarity pairs (>65%) and medium similarity pairs (40-65%)
- Group questions by similar patterns and stems
- Provide detailed debugging information for developers

VALIDATION METRICS:
- Total comparisons performed
- Similarity threshold analysis
- Pattern matching detection
- Question stem duplication identification
- Content focus analysis and cognitive level distribution

DEBUG OUTPUT FORMAT:
{
  "success": boolean,
  "debug": {
    "totalGenerated": number,
    "duplicateAnalysis": {
      "highSimilarityPairs": array,
      "mediumSimilarityPairs": array,
      "allSimilarities": array
    },
    "patternAnalysis": {
      "duplicatePatterns": array
    },
    "stemAnalysis": {
      "duplicateStems": array
    },
    "questionSample": array
  }
}`
```

### 2. Interactive Debug Interface
```typescript
debugQuestionsInterface: `🔍 Question Generation Debugger

INTERACTIVE FEATURES:
- Test content input with sample React content
- Configurable question count (1-30)
- Real-time generation testing with comprehensive analysis
- Visual debugging results with color-coded severity levels

ANALYSIS CATEGORIES:
- Summary: Generated vs requested questions, processing time, model used
- Duplicate Analysis: High/medium similarity pairs with detailed comparisons
- Pattern Analysis: Repeated question patterns and structures
- Stem Analysis: Duplicate question beginnings and structures
- Sample Questions: Preview of generated questions with metadata

VISUAL FEEDBACK:
- Success states (green) for good diversity
- Warning states (yellow) for medium issues
- Error states (red) for high similarity/duplicates
- Loading states during generation and analysis
- Empty states with helpful guidance

USER EXPERIENCE:
- Load sample content button for quick testing
- Real-time progress indicators
- Detailed error reporting with stack traces
- Interactive results with expandable sections`
```

## 📊 Advanced Deduplication System Prompts

### 1. Semantic Similarity Detection
```typescript
semanticSimilarityAnalysis: `SEMANTIC SIMILARITY DETECTION

ADVANCED ALGORITHMS:
- Extract key concepts from question text
- Calculate concept overlap between questions
- Analyze question intent and structure patterns
- Detect same meaning with different words

SIMILARITY METRICS:
- Jaccard similarity (word-based overlap)
- Levenshtein distance similarity (edit distance)
- Cosine similarity (character n-grams)
- Semantic concept overlap analysis

THRESHOLD MANAGEMENT:
- Lowered similarity threshold from 80% to 65%
- Stricter duplicate detection for better quality
- Multi-algorithm approach for comprehensive analysis
- Real-time diversity validation during generation

DEDUPLICATION FEATURES:
- Question pattern extraction and comparison
- Subject analysis for question focus areas
- Cognitive level distribution analysis
- Content hash generation for unique identification`
```

### 2. Real-Time Diversity Validation
```typescript
diversityValidation: `REAL-TIME DIVERSITY VALIDATION

BATCH DIVERSITY SCORING:
- Calculate diversity score for each generated batch
- Compare each question with every other question in batch
- Average similarity calculation with diversity scoring
- Reject batches with diversity score below 70%

VALIDATION PROCESS:
1. Generate question batch using AI model
2. Calculate batch diversity score
3. If diversity < 70%, try next AI model
4. Continue until acceptable diversity achieved
5. Log diversity metrics for monitoring

DIVERSITY METRICS:
- Batch diversity score (higher = more diverse)
- Individual question similarity comparisons
- Pattern detection and repetition analysis
- Cognitive level distribution validation

QUALITY ASSURANCE:
- Only high-diversity question batches accepted
- Automatic model switching for better results
- Comprehensive logging with emoji indicators
- Performance monitoring and optimization`
```

## 🚀 Model Prioritization and Fallback Prompts

### 1. AI Model Configuration Strategy
```typescript
modelPrioritization: `AI MODEL PRIORITIZATION STRATEGY

ENHANCED MODEL ORDER:
1. llama-3.1-8b-instant (Groq) - Primary choice for fast, reliable generation
2. llama-3.1-70b-versatile (Groq) - More capable model for complex content
3. doubao-1-5-pro-32k-250115 (Xroute) - Alternative for diversity
4. mixtral-8x7b-32768 (Groq) - Large context window model
5. enhanced-local-generator - Fallback only when APIs fail

MODEL SELECTION BENEFITS:
- Prioritizes more capable AI models over local generation
- Uses Groq's fast and reliable API as primary choice
- Provides multiple fallback options for reliability
- Intelligent timeout management per model type

TIMEOUT CONFIGURATION:
- Fireworks: 25 seconds (increased for better generation)
- Other models: 50 seconds (extended for quality)
- Model-specific timeout handling
- Graceful fallback to next available model

RELIABILITY FEATURES:
- Multiple API provider support
- Automatic model health checking
- Intelligent fallback strategies
- Performance monitoring and logging`
```

### 2. Content Sectioning Strategy
```typescript
contentSectioning: `CONTENT SECTIONING FOR DIVERSITY

SMART CONTENT SPLITTING:
- Divide content into logical sections (paragraphs or sentence groups)
- Use different sections for each question batch
- Ensure questions come from different parts of content
- Prevent over-focusing on single content areas

SECTIONING ALGORITHM:
1. Try to split by paragraphs first (>100 chars each)
2. If insufficient paragraphs, split by sentences into chunks
3. Create 3+ sections from content for diversity
4. Rotate through sections for each question batch

DIVERSITY BENEFITS:
- Questions test different aspects of content
- Prevents repetition from same content area
- Ensures comprehensive coverage of material
- Improves overall question variety and quality

IMPLEMENTATION:
```typescript
private splitContentIntoSections(content: string): string[] {
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 100)
  
  if (paragraphs.length >= 3) {
    return paragraphs // Use paragraphs as sections
  } else {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 50)
    const chunkSize = Math.ceil(sentences.length / 3)
    // Create 3 sections from sentences
  }
}
```

## 📈 Performance Monitoring and Logging Prompts

### 1. Comprehensive Logging System
```typescript
loggingSystem: `COMPREHENSIVE LOGGING SYSTEM

EMOJI INDICATORS:
🔍 - Deduplication analysis
📊 - Diversity analysis  
✅ - Success operations
🚨 - Duplicate detection
⚠️ - Warnings and issues
🎯 - Completion summaries

DETAILED LOGGING:
- Before/after deduplication counts
- Individual question previews with metadata
- Duplicate group analysis with similarity scores
- Batch diversity scoring with percentages
- Model performance and timeout tracking

LOG CATEGORIES:
- Generation Process: Model selection, content processing, batch creation
- Diversity Analysis: Similarity calculations, pattern detection, validation
- Deduplication: Duplicate identification, removal statistics, final counts
- Performance: Processing times, model success rates, error tracking

MONITORING FEATURES:
- Real-time console output during generation
- Structured logging for debugging and analysis
- Performance metrics collection
- Error tracking and resolution guidance`
```

### 2. Quality Metrics and Validation
```typescript
qualityMetrics: `QUALITY METRICS AND VALIDATION

SUCCESS INDICATORS:
- Diversity Score: >70% for question batches
- Uniqueness Rate: <5% duplicates after deduplication  
- Cognitive Distribution: Balanced across thinking levels
- Question Quality: >0.8 average quality score

FAILURE PATTERNS:
- High Similarity: >65% similarity between questions
- Repeated Stems: Same question beginnings
- Limited Scope: All questions from same content section
- Single Cognitive Level: No variety in thinking skills

VALIDATION PROCESS:
1. Generate question batch
2. Calculate diversity metrics
3. Validate against quality thresholds
4. Accept or reject batch based on scores
5. Try next model if quality insufficient

CONTINUOUS IMPROVEMENT:
- A/B testing of prompt variations
- Performance analysis and monitoring
- User feedback incorporation
- Iterative refinement based on results`
```

The prompt templates have evolved from basic question generation to sophisticated diversity-enforced systems that ensure truly unique, high-quality educational content. The current system includes advanced deduplication, semantic similarity detection, real-time diversity validation, intelligent model fallbacks, and comprehensive debugging tools.