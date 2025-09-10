export interface QuizQuestion {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
  required: boolean;
}

export interface QuizOption {
  id: string;
  label: string;
  value: string;
}

export interface QuizResponse {
  questionId: string;
  selectedValues: string[];
}

export interface QuizResult {
  programId: string;
  programName: string;
  compatibility: number;
  estimatedTime: string;
  investment: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  description: string;
}

export interface Lead {
  name: string;
  email: string;
  whatsapp?: string;
  location?: string;
  immigrationTimeline: string;
  quizResults: QuizResult[];
}

export interface ImmigrationProgram {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  investment: string;
  threshold: number;
}

export type QuizState = 'intro' | 'questions' | 'results' | 'lead-capture' | 'thank-you';