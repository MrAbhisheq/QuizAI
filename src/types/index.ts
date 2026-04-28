export type QuestionType = 'multiple-choice' | 'true-false' | 'mixed';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  content: string;
  questionType: QuestionType;
  difficulty?: DifficultyLevel;
  timeLimit?: number; // in minutes, optional
  questions: QuizQuestion[];
  createdAt: Date;
  enabled?: boolean;
}

export interface QuizScore {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  notAttempted: number;
  percentage: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  participantName: string;
  answers: string[];
  score: number;
  completionTime?: number; // in seconds
  createdAt: Date;
}

export interface ApiKeys {
  openai?: string;
  gemini?: string;
  huggingface?: string;
  groq?: string;
  deepseek?: string;
  anthropic?: string;
  mistral?: string;
}

export interface UserSettings {
  aiModel: string;
  defaultNumberOfQuestions: number;
  defaultQuestionType: QuestionType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  settings: UserSettings;
  apiKeys?: ApiKeys;
}

export interface AIProvider {
  name: string;
  generateQuiz: (
    content: string,
    numberOfQuestions: number,
    questionType: QuestionType
  ) => Promise<QuizQuestion[]>;
}
