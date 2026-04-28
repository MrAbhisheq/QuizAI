import { QuestionType, QuizQuestion, AIProvider } from '../../types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { HuggingFaceProvider } from './huggingface';
import { GroqProvider } from './groq';
import { DeepSeekProvider } from './deepseek';
import { AnthropicProvider } from './anthropic';
import { MistralProvider } from './mistral';

export class AIService {
  private providers: Map<string, AIProvider>;

  constructor() {
    this.providers = new Map();
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('gemini', new GeminiProvider());
    this.registerProvider('huggingface', new HuggingFaceProvider());
    this.registerProvider('groq', new GroqProvider());
    this.registerProvider('deepseek', new DeepSeekProvider());
    this.registerProvider('anthropic', new AnthropicProvider());
    this.registerProvider('mistral', new MistralProvider());
  }

  registerProvider(name: string, provider: AIProvider) {
    this.providers.set(name, provider);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async generateQuiz(
    providerName: string,
    content: string,
    numberOfQuestions: number,
    questionType: QuestionType
  ): Promise<QuizQuestion[]> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`AI provider '${providerName}' not found`);
    }

    try {
      const questions = await provider.generateQuiz(content, numberOfQuestions, questionType);
      
      // Validate the response
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response from AI provider');
      }

      // Validate each question
      questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correctAnswer) {
          throw new Error(`Invalid question format at index ${index}`);
        }
        if (questionType === 'true-false' && q.options.length !== 2) {
          throw new Error(`True/False question must have exactly 2 options`);
        }
        if (questionType === 'multiple-choice' && q.options.length !== 4) {
          throw new Error(`Multiple choice question must have exactly 4 options`);
        }
        if (questionType === 'mixed' && q.options.length !== 2 && q.options.length !== 4) {
          throw new Error(`Mixed questions must have either 2 or 4 options`);
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error(`Correct answer not found in options for question: ${q.question}`);
        }
      });

      return questions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
