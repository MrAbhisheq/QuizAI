import { QuestionType, QuizQuestion, AIProvider } from '../../types';

export class MistralProvider implements AIProvider {
  name = 'Mistral AI';
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async generateQuiz(
    content: string,
    numberOfQuestions: number,
    questionType: QuestionType
  ): Promise<QuizQuestion[]> {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('mistral_api_key') || 
                    import.meta.env.VITE_MISTRAL_API_KEY || null;
    }

    if (!this.apiKey) {
      throw new Error('Mistral API key not configured. Please add it in Settings.');
    }

    const prompt = this.buildPrompt(content, numberOfQuestions, questionType);

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a quiz generator. You must respond ONLY with valid JSON, no other text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const textContent = data.choices[0]?.message?.content;

      if (!textContent) {
        throw new Error('No content in Mistral response');
      }

      // Parse the JSON response
      let jsonText = textContent.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const questions = JSON.parse(jsonText);
      return this.normalizeQuestions(questions);
    } catch (error) {
      console.error('Mistral generation error:', error);
      throw error;
    }
  }

  private buildPrompt(content: string, numberOfQuestions: number, questionType: QuestionType): string {
    if (questionType === 'mixed') {
      return `Generate ${numberOfQuestions} quiz questions (mix of Multiple Choice with 4 options and True/False with 2 options) based STRICTLY on the following content.

Content:
${content}

Requirements:
1. Questions must be based ONLY on the provided content
2. Mix multiple choice (4 options) and true/false (2 options: "True", "False") questions
3. Each multiple choice question must have exactly 4 distinct options
4. Each true/false question must have exactly 2 options: ["True", "False"]
5. Questions should be clear and unambiguous
6. Avoid duplicate questions
7. Moderate difficulty level
8. correctAnswer must be one of the options (exact match)

Respond with ONLY a JSON array in this exact format, no other text:
[
  {
    "question": "Multiple choice question?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Option 1"
  },
  {
    "question": "True/False question?",
    "options": ["True", "False"],
    "correctAnswer": "True"
  }
]`;
    }

    const optionsCount = questionType === 'true-false' ? 2 : 4;
    const questionTypeDescription = questionType === 'true-false' 
      ? 'True/False questions with exactly 2 options: ["True", "False"]'
      : 'Multiple choice questions with exactly 4 distinct options';

    return `Generate ${numberOfQuestions} ${questionTypeDescription} based STRICTLY on the following content. 

Content:
${content}

Requirements:
1. Questions must be based ONLY on the provided content
2. Each question must have exactly ${optionsCount} options
3. Questions should be clear and unambiguous
4. Avoid duplicate questions
5. Moderate difficulty level
6. correctAnswer must be one of the options (exact match)

Respond with ONLY a JSON array in this exact format, no other text:
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2"${optionsCount === 4 ? ', "Option 3", "Option 4"' : ''}],
    "correctAnswer": "Option 1"
  }
]`;
  }

  private normalizeQuestions(questions: any): QuizQuestion[] {
    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    return questions.map((q: any) => ({
      question: q.question || q.text || '',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || q.correct_answer || q.answer || ''
    }));
  }
}
