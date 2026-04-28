import { QuestionType, QuizQuestion, AIProvider } from '../../types';

export class HuggingFaceProvider implements AIProvider {
  name = 'HuggingFace';
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
      this.apiKey = localStorage.getItem('huggingface_api_key') || 
                    import.meta.env.VITE_HUGGINGFACE_API_KEY || null;
    }

    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured. Please add it in Settings.');
    }

    const optionsCount = questionType === 'true-false' ? 2 : 4;
    const prompt = this.buildPrompt(content, numberOfQuestions, questionType, optionsCount);

    try {
      // Using a free model like mistral or llama
      const response = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.7,
              return_full_text: false
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      let textContent = '';

      if (Array.isArray(data) && data[0]?.generated_text) {
        textContent = data[0].generated_text;
      } else if (data.generated_text) {
        textContent = data.generated_text;
      } else {
        throw new Error('Unexpected HuggingFace response format');
      }

      // Extract JSON from the response
      let jsonText = textContent.trim();
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const questions = JSON.parse(jsonText);
      return this.normalizeQuestions(questions);
    } catch (error) {
      console.error('HuggingFace generation error:', error);
      throw error;
    }
  }

  private buildPrompt(content: string, numberOfQuestions: number, questionType: QuestionType, optionsCount: number): string {
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

Respond with ONLY a JSON array:
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

Respond with ONLY a JSON array in this exact format:
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
