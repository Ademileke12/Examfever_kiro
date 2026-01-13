import { QuestionType, DifficultyLevel } from '@/lib/questions/types'

export interface PromptTemplate {
  system: string
  user: string
  examples?: string[]
}

export function getQuestionGenerationPrompt(
  content: string,
  questionType: QuestionType,
  difficulty: DifficultyLevel,
  maxQuestions: number = 5
): PromptTemplate {
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

  const templates: Record<QuestionType, PromptTemplate> = {
    'multiple-choice': {
      system: baseSystem,
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
]`,
      examples: [
        `Example for medium difficulty:
{
  "question": "What is the primary function of mitochondria in cells?",
  "options": [
    {"text": "Protein synthesis", "correct": false},
    {"text": "Energy production", "correct": true},
    {"text": "DNA storage", "correct": false},
    {"text": "Waste removal", "correct": false}
  ],
  "explanation": "Mitochondria are known as the powerhouses of cells because they produce ATP through cellular respiration",
  "topic": "Cell Biology",
  "keywords": ["mitochondria", "ATP", "cellular respiration"]
}`
      ]
    }
  }

  return templates[questionType]
}

export function getContentAnalysisPrompt(content: string): PromptTemplate {
  return {
    system: `You are an expert content analyzer. Analyze the provided educational content and extract key information about topics, concepts, and appropriate difficulty levels.`,
    user: `Analyze the following content and provide a JSON response with this structure:

Content:
${content}

{
  "topics": ["main topic 1", "main topic 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "concepts": ["concept1", "concept2"],
  "difficulty": "easy|medium|hard",
  "contentType": "academic|technical|general",
  "suggestedQuestionTypes": ["multiple-choice"] // Only support multiple-choice questions
}`
  }
}

export function getQuestionValidationPrompt(question: string, questionType: QuestionType): PromptTemplate {
  return {
    system: `You are an expert educational content reviewer. Evaluate the quality of the provided question and provide detailed feedback.`,
    user: `Evaluate this ${questionType} question and provide a JSON response:

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
  }
}