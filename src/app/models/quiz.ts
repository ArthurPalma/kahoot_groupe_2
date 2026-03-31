import { Question } from "./question";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  questions: Question[];
  nbQuestions: number;
}

export type BasicQuiz = Omit<Quiz, 'questions' | 'ownerId'> & {};
