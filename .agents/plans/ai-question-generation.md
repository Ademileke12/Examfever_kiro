# Feature: AI Question Generation from PDFs

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement an intelligent question generation system that analyzes extracted PDF text content and generates high-quality, relevant exam questions using multiple AI models. The system will use Gemini 1.5 Flash as the primary model with fallback to free local models (Ollama, Hugging Face Transformers) to ensure reliability and cost-effectiveness. It will generate various question types including multiple choice, short answer, and essay questions with different difficulty levels.

## User Story

As a student who has uploaded study materials
I want the AI to generate relevant, challenging practice questions from my PDFs
So that I can test my knowledge effectively and prepare for real exams with questions that match my study content

## Problem Statement

Students need an AI system that can intelligently analyze their study materials and generate high-quality practice questions that are relevant, appropriately challenging, and varied in format. The system must be reliable, cost-effective, and capable of handling different types of content while maintaining question quality.

## Solution Statement

Build a robust AI question generation pipeline that processes extracted PDF text through multiple AI models, starting with Gemini 1.5 Flash for optimal quality and falling back to local models for reliability. The system will use intelligent prompt engineering, content chunking, question validation, and quality scoring to ensure generated questions are relevant, well-formed, and educationally valuable.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: AI processing pipeline, question generation, content analysis, model management
**Dependencies**: Gemini 1.5 Flash API, Ollama, Hugging Face Transformers, PDF text processing

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

This feature builds upon the PDF upload and processing system:

- `.agents/plans/pdf-upload-processing-system.md` - PDF processing pipeline that provides text input
- `.kiro/steering/structure.md` - Project structure for AI processing components
- `.kiro/steering/tech.md` - Technical architecture including Gemini 1.5 Flash integration
- `.kiro/steering/product.md` - Product requirements for question generation

### New Files to Create

**AI Processing Components:**
- `lib/ai/gemini-client.ts` - Gemini 1.5 Flash API client and utilities
- `lib/ai/local-models.ts` - Local AI model management (Ollama, HuggingFace)
- `lib/ai/question-generator.ts` - Main question generation orchestrator
- `lib/ai/prompt-templates.ts` - Optimized prompts for different question types
- `lib/ai/content-processor.ts` - Text chunking and preprocessing utilities
- `lib/ai/question-validator.ts` - Question quality validation and scoring

**Question Management:**
- `lib/questions/types.ts` - Question and answer type definitions
- `lib/questions/formatter.ts` - Question formatting and standardization
- `lib/questions/difficulty-analyzer.ts` - Difficulty level assessment
- `lib/questions/topic-extractor.ts` - Content topic and keyword extraction

**API Routes:**
- `app/api/ai/generate-questions/route.ts` - Question generation endpoint
- `app/api/ai/validate-questions/route.ts` - Question validation endpoint
- `app/api/ai/models/status/route.ts` - AI model status and health check

**Background Processing:**
- `lib/jobs/question-generation-job.ts` - Background job for question generation
- `lib/jobs/model-health-check.ts` - AI model availability monitoring

**Database Schema:**
- `supabase/migrations/003_questions_schema.sql` - Questions and generation metadata
- `supabase/migrations/004_ai_processing_logs.sql` - AI processing logs and analytics

**Configuration:**
- `lib/ai/config.ts` - AI model configuration and fallback strategies
- `lib/ai/rate-limiter.ts` - API rate limiting and quota management

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Gemini 1.5 Flash API Documentation](https://ai.google.dev/gemini-api/docs)
  - Specific section: Text generation, rate limits, and best practices
  - Why: Primary AI model for question generation with 1,500 daily requests free tier
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
  - Specific section: Local model deployment and API usage
  - Why: Local fallback for question generation when Gemini quota is exceeded
- [Hugging Face Transformers Question Generation](https://huggingface.co/iarfmoose/t5-base-question-generator)
  - Specific section: T5-based question generation models
  - Why: Specialized models for generating questions from context
- [Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
  - Specific section: Few-shot prompting and instruction following
  - Why: Critical for generating high-quality, consistent questions

### Patterns to Follow

**AI Model Fallback Pattern:**
```typescript
async function generateQuestions(content: string): Promise<Question[]> {
  try {
    return await geminiGenerate(content);
  } catch (error) {
    console.warn('Gemini failed, trying local model:', error);
    return await localModelGenerate(content);
  }
}
```

**Content Chunking Pattern:**
```typescript
function chunkContent(text: string, maxTokens: number): string[] {
  // Split content into manageable chunks for AI processing
  // Preserve sentence boundaries and context
}
```

**Question Validation Pattern:**
```typescript
interface QuestionQuality {
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

function validateQuestion(question: Question): QuestionQuality {
  // Validate question structure, clarity, and educational value
}
```

**Rate Limiting Pattern:**
```typescript
class RateLimiter {
  async checkQuota(model: string): Promise<boolean> {
    // Check if model has available quota
  }
  
  async waitForQuota(model: string): Promise<void> {
    // Wait for quota refresh if needed
  }
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: AI Infrastructure Setup

Set up the AI model infrastructure with Gemini 1.5 Flash integration and local model fallbacks.

**Tasks:**
- Configure Gemini 1.5 Flash API client with authentication
- Set up Ollama for local model deployment
- Install and configure Hugging Face Transformers
- Implement rate limiting and quota management
- Create AI model health monitoring

### Phase 2: Question Generation Pipeline

Build the core question generation pipeline with content processing and prompt engineering.

**Tasks:**
- Develop content chunking and preprocessing utilities
- Create optimized prompt templates for different question types
- Implement the main question generation orchestrator
- Build question validation and quality scoring
- Add support for multiple question formats and difficulty levels

### Phase 3: Model Integration & Fallbacks

Integrate multiple AI models with intelligent fallback strategies and performance optimization.

**Tasks:**
- Implement Gemini 1.5 Flash question generation
- Set up local model alternatives (T5, FLAN-T5, Qwen)
- Create model selection and fallback logic
- Add performance monitoring and analytics
- Implement caching for improved efficiency

### Phase 4: API & Background Processing

Create API endpoints and background job processing for scalable question generation.

**Tasks:**
- Build question generation API endpoints
- Implement background job processing
- Add database schema for questions and metadata
- Create question management and retrieval systems
- Add comprehensive error handling and logging

### Phase 5: Quality Assurance & Optimization

Implement quality validation, performance optimization, and comprehensive testing.

**Tasks:**
- Add question quality validation and scoring
- Implement content topic extraction and categorization
- Optimize prompt engineering for better results
- Add comprehensive testing and validation
- Performance tuning and cost optimization

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE .env.local (AI variables)

- **IMPLEMENT**: Add AI model API keys and configuration
- **PATTERN**: Environment variables for Gemini API and local model paths
- **IMPORTS**: None required
- **GOTCHA**: Keep Gemini API key secure and never expose in client-side code
- **VALIDATE**: `echo $GEMINI_API_KEY && echo $OLLAMA_HOST`

### CREATE lib/ai/config.ts

- **IMPLEMENT**: AI model configuration and fallback strategies
- **PATTERN**: Configuration object with model priorities and settings
- **IMPORTS**: Environment variables, model types
- **GOTCHA**: Include rate limits, token limits, and fallback priorities
- **VALIDATE**: `npx tsc --noEmit`

### CREATE lib/questions/types.ts

- **IMPLEMENT**: Comprehensive type definitions for questions and answers
- **PATTERN**: TypeScript interfaces with proper typing for all question formats
- **IMPORTS**: None required
- **GOTCHA**: Include all question types (MCQ, short answer, essay) and metadata
- **VALIDATE**: `npx tsc --noEmit`

### CREATE lib/ai/rate-limiter.ts

- **IMPLEMENT**: Rate limiting and quota management for AI APIs
- **PATTERN**: Class-based rate limiter with Redis or in-memory storage
- **IMPORTS**: Redis client or Map for storage
- **GOTCHA**: Handle different rate limits for different models and tiers
- **VALIDATE**: Test rate limiting with mock API calls

### CREATE lib/ai/gemini-client.ts

- **IMPLEMENT**: Gemini 1.5 Flash API client with error handling
- **PATTERN**: API client class with retry logic and rate limiting
- **IMPORTS**: Google AI SDK, rate limiter, configuration
- **GOTCHA**: Handle API errors, rate limits, and token limits properly
- **VALIDATE**: Test API connection and basic text generation

### CREATE lib/ai/prompt-templates.ts

- **IMPLEMENT**: Optimized prompt templates for different question types
- **PATTERN**: Template functions with parameters for content and question type
- **IMPORTS**: Question types, content processing utilities
- **GOTCHA**: Include few-shot examples and clear instructions for each question type
- **VALIDATE**: Test prompt generation with sample content

### CREATE lib/ai/content-processor.ts

- **IMPLEMENT**: Text chunking and preprocessing utilities
- **PATTERN**: Utility functions for content analysis and chunking
- **IMPORTS**: Natural language processing utilities
- **GOTCHA**: Preserve context boundaries and handle different content types
- **VALIDATE**: Test chunking with various PDF text samples

### CREATE lib/ai/local-models.ts

- **IMPLEMENT**: Local AI model management (Ollama, Hugging Face)
- **PATTERN**: Model manager class with loading and inference capabilities
- **IMPORTS**: Ollama API client, Hugging Face Transformers
- **GOTCHA**: Handle model loading, memory management, and inference optimization
- **VALIDATE**: Test local model loading and basic question generation

### CREATE lib/ai/question-validator.ts

- **IMPLEMENT**: Question quality validation and scoring system
- **PATTERN**: Validation functions with scoring algorithms
- **IMPORTS**: Question types, natural language processing
- **GOTCHA**: Include checks for clarity, relevance, difficulty, and educational value
- **VALIDATE**: Test validation with good and poor quality questions

### CREATE lib/questions/formatter.ts

- **IMPLEMENT**: Question formatting and standardization utilities
- **PATTERN**: Formatter functions for consistent question structure
- **IMPORTS**: Question types, validation utilities
- **GOTCHA**: Handle different input formats and ensure consistent output
- **VALIDATE**: Test formatting with various question formats

### CREATE lib/questions/difficulty-analyzer.ts

- **IMPLEMENT**: Difficulty level assessment for generated questions
- **PATTERN**: Analysis functions using content complexity metrics
- **IMPORTS**: Natural language processing, question types
- **GOTCHA**: Consider vocabulary complexity, concept depth, and cognitive load
- **VALIDATE**: Test difficulty assessment with questions of known difficulty

### CREATE lib/questions/topic-extractor.ts

- **IMPLEMENT**: Content topic and keyword extraction utilities
- **PATTERN**: Topic extraction using NLP and keyword analysis
- **IMPORTS**: Natural language processing libraries
- **GOTCHA**: Handle different subject domains and extract relevant topics
- **VALIDATE**: Test topic extraction with various academic content

### CREATE lib/ai/question-generator.ts

- **IMPLEMENT**: Main question generation orchestrator
- **PATTERN**: Orchestrator class coordinating all generation components
- **IMPORTS**: All AI clients, processors, validators, and formatters
- **GOTCHA**: Handle model fallbacks, quality validation, and error recovery
- **VALIDATE**: Test complete question generation pipeline

### CREATE lib/jobs/question-generation-job.ts

- **IMPLEMENT**: Background job for processing question generation requests
- **PATTERN**: Job processor with queue management and error handling
- **IMPORTS**: Question generator, database utilities, job queue
- **GOTCHA**: Handle long-running processes and job failure recovery
- **VALIDATE**: Test background job processing with sample PDFs

### CREATE lib/jobs/model-health-check.ts

- **IMPLEMENT**: AI model availability and health monitoring
- **PATTERN**: Health check service with status reporting
- **IMPORTS**: AI model clients, monitoring utilities
- **GOTCHA**: Check model availability, response times, and error rates
- **VALIDATE**: Test health checks for all configured models

### CREATE supabase/migrations/003_questions_schema.sql

- **IMPLEMENT**: Database schema for questions and generation metadata
- **PATTERN**: SQL schema with proper indexes and relationships
- **IMPORTS**: None required
- **GOTCHA**: Include all question types, metadata, and performance indexes
- **VALIDATE**: `supabase db push` and verify schema creation

### CREATE supabase/migrations/004_ai_processing_logs.sql

- **IMPLEMENT**: AI processing logs and analytics schema
- **PATTERN**: SQL schema for logging AI operations and performance
- **IMPORTS**: None required
- **GOTCHA**: Include model usage, performance metrics, and error tracking
- **VALIDATE**: `supabase db push` and verify logging schema

### CREATE app/api/ai/generate-questions/route.ts

- **IMPLEMENT**: Question generation API endpoint
- **PATTERN**: Next.js API route with request validation and processing
- **IMPORTS**: Question generator, validation utilities, database client
- **GOTCHA**: Handle large requests, timeouts, and proper error responses
- **VALIDATE**: `curl -X POST http://localhost:3000/api/ai/generate-questions -d '{"content":"test"}'`

### CREATE app/api/ai/validate-questions/route.ts

- **IMPLEMENT**: Question validation API endpoint
- **PATTERN**: Next.js API route with validation processing
- **IMPORTS**: Question validator, formatting utilities
- **GOTCHA**: Handle batch validation and provide detailed feedback
- **VALIDATE**: Test validation endpoint with sample questions

### CREATE app/api/ai/models/status/route.ts

- **IMPLEMENT**: AI model status and health check endpoint
- **PATTERN**: Next.js API route with health monitoring
- **IMPORTS**: Model health checker, status utilities
- **GOTCHA**: Provide real-time status and availability information
- **VALIDATE**: `curl http://localhost:3000/api/ai/models/status`

### CREATE components/ai/QuestionGenerationStatus.tsx

- **IMPLEMENT**: UI component for showing question generation progress
- **PATTERN**: React component with real-time status updates
- **IMPORTS**: React hooks, WebSocket or polling utilities
- **GOTCHA**: Handle different generation states and provide user feedback
- **VALIDATE**: Test component with mock generation process

### CREATE components/ai/GeneratedQuestions.tsx

- **IMPLEMENT**: UI component for displaying and managing generated questions
- **PATTERN**: React component with question list and management features
- **IMPORTS**: Question types, UI components, state management
- **GOTCHA**: Handle different question types and provide editing capabilities
- **VALIDATE**: Test component with various question formats

### CREATE hooks/useQuestionGeneration.ts

- **IMPLEMENT**: Hook for managing question generation state and operations
- **PATTERN**: Custom hook with generation state and API integration
- **IMPORTS**: React hooks, API utilities, question types
- **GOTCHA**: Handle loading states, errors, and real-time updates
- **VALIDATE**: Test hook with React Testing Library

### CREATE app/generate/page.tsx

- **IMPLEMENT**: Question generation page with file selection and options
- **PATTERN**: Next.js page with generation interface and controls
- **IMPORTS**: Generation components, file selection, options forms
- **GOTCHA**: Handle file selection, generation options, and result display
- **VALIDATE**: Navigate to /generate and test complete generation workflow

### UPDATE lib/pdf/processor.ts

- **IMPLEMENT**: Add integration with question generation pipeline
- **PATTERN**: Extend PDF processor to trigger question generation
- **IMPORTS**: Question generation utilities, job queue
- **GOTCHA**: Handle PDF processing completion and trigger generation
- **VALIDATE**: Test PDF upload triggering question generation

---

## TESTING STRATEGY

### Unit Tests

**Framework**: Jest with comprehensive mocking for AI services
**Scope**: Individual AI components, question validation, and content processing
**Coverage**: Minimum 85% coverage for critical AI processing logic

Design unit tests with extensive scenarios:
- Test AI model clients with mock responses
- Verify question validation and scoring algorithms
- Test content chunking and preprocessing
- Validate prompt template generation
- Test fallback mechanisms and error handling

### Integration Tests

**Framework**: Playwright for end-to-end question generation workflows
**Scope**: Complete generation pipeline from PDF to questions
**Coverage**: Full workflow testing with real and mock AI models

### AI Model Tests

**Framework**: Custom testing framework for AI model validation
**Scope**: Question quality, relevance, and consistency testing
**Coverage**: Test with various content types and question formats

### Performance Tests

**Framework**: Load testing with concurrent generation requests
**Scope**: API performance, model response times, and resource usage
**Coverage**: Rate limiting, quota management, and scalability

### Edge Cases

**AI Model Edge Cases:**
- API rate limit exceeded scenarios
- Model unavailability and fallback testing
- Invalid or corrupted content processing
- Extremely long or short content handling

**Question Quality Edge Cases:**
- Low-quality content input
- Technical or specialized content
- Multiple languages or mixed content
- Content with minimal extractable information

**Performance Edge Cases:**
- Concurrent generation requests
- Large PDF processing
- Model switching during generation
- Network interruptions during API calls

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript compilation
npx tsc --noEmit

# ESLint checking
npx eslint . --ext .ts,.tsx

# Prettier formatting
npx prettier --check .

# AI model configuration validation
npm run validate:ai-config
```

### Level 2: Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific AI test suites
npm run test -- --testPathPattern=ai
npm run test -- --testPathPattern=questions
npm run test -- --testPathPattern=generation
```

### Level 3: Integration Tests

```bash
# Start development server
npm run dev

# Start local AI models (if using Ollama)
ollama serve

# Run Playwright tests
npx playwright test

# Run specific generation test suites
npx playwright test --grep "question generation"
npx playwright test --grep "AI model fallback"
```

### Level 4: AI Model Testing

```bash
# Test Gemini API connection
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Generate a test question"}]}]}'

# Test local model availability
curl http://localhost:11434/api/tags

# Test question generation endpoint
curl -X POST http://localhost:3000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"content": "Sample educational content for testing"}'

# Test model status endpoint
curl http://localhost:3000/api/ai/models/status
```

### Level 5: Performance Testing

```bash
# Load test question generation
npx artillery run load-test-config.yml

# Monitor AI model performance
npm run monitor:ai-performance

# Test rate limiting
for i in {1..20}; do curl -X POST http://localhost:3000/api/ai/generate-questions; done
```

### Level 6: Manual Validation

**Question Generation Testing:**
- Upload a PDF and trigger question generation
- Verify questions are relevant to content
- Test different question types and difficulty levels
- Validate question quality and educational value
- Test generation with various content types

**AI Model Fallback Testing:**
- Simulate Gemini API quota exhaustion
- Verify fallback to local models works
- Test model switching during generation
- Validate consistent question quality across models

**Performance Testing:**
- Test generation with large PDFs
- Verify response times meet requirements
- Test concurrent generation requests
- Monitor resource usage during generation

---

## ACCEPTANCE CRITERIA

- [ ] AI generates relevant questions from PDF content
- [ ] Multiple question types supported (MCQ, short answer, essay)
- [ ] Question difficulty levels are appropriately assessed
- [ ] Gemini 1.5 Flash integration works within free tier limits
- [ ] Local model fallback works when primary model unavailable
- [ ] Question quality validation ensures educational value
- [ ] Generation process provides real-time progress feedback
- [ ] API endpoints handle concurrent requests efficiently
- [ ] Rate limiting prevents quota exhaustion
- [ ] Generated questions are properly formatted and stored
- [ ] Content chunking preserves context and meaning
- [ ] Topic extraction identifies relevant subject areas
- [ ] Background job processing handles long-running tasks
- [ ] Error handling provides clear feedback for failures
- [ ] Performance meets requirements for user experience
- [ ] Integration with PDF processing pipeline works seamlessly

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration + AI model tests)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms question generation works end-to-end
- [ ] Acceptance criteria all met
- [ ] Code reviewed for AI best practices and security
- [ ] Performance optimized for AI model usage
- [ ] Rate limiting and quota management tested
- [ ] Question quality validation thoroughly tested
- [ ] Documentation updated for AI integration
- [ ] Error handling covers all AI model scenarios

---

## NOTES

**AI Model Strategy:**
- **Primary**: Gemini 1.5 Flash (1,500 daily requests free tier)
- **Fallback 1**: Ollama with local models (T5, FLAN-T5, Qwen)
- **Fallback 2**: Hugging Face Transformers (specialized question generation models)
- **Emergency**: Rule-based question generation from content analysis

**Cost Optimization:**
- Intelligent content chunking to maximize token efficiency
- Caching of generated questions to avoid regeneration
- Rate limiting to stay within free tier quotas
- Local model usage for development and testing

**Quality Assurance:**
- Multi-stage validation: structure, relevance, difficulty, clarity
- Human-in-the-loop validation for quality improvement
- A/B testing of different prompt strategies
- Continuous monitoring of question quality metrics

**Performance Considerations:**
- Asynchronous processing for large content
- Background job queues for scalability
- Model warm-up strategies for faster response times
- Intelligent batching of generation requests

**Security & Privacy:**
- No sensitive content sent to external APIs without user consent
- Local model processing for sensitive educational materials
- Audit logging of all AI model interactions
- Secure API key management and rotation

**Future Enhancements:**
- Fine-tuning local models on educational content
- Advanced question type support (diagram-based, calculation)
- Adaptive difficulty based on user performance
- Multi-language question generation support
- Integration with educational standards and curricula
