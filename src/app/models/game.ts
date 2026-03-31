import { BasicQuiz, Quiz } from "./quiz";

export enum GameStatus {
  WAITING = 'WAITING',
  QUESTION_IN_PROGRESS = 'QUESTION_IN_PROGRESS',
  QUESTION_FINISHED = 'QUESTION_FINISHED',
  FINISHED = 'FINISHED',
}

export interface Game {
  id: string;
  quiz: Quiz;
  adminId: string;
  status: GameStatus;
  currentQuestionId: string | null;
  currentQuestionNumber: number | null;
  players: Player[];
}

export type BasicGame = Omit<Game, 'quiz' | 'players'> & {
  quiz: BasicQuiz;
}

export interface Player {
  userId: string;
  alias: string;
  currentAnswerIndex: number | null;
  score: number;
  isDisconnected: boolean;
};
