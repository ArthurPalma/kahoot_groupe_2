import { Quiz } from "./quiz";

export enum GameStatus {
  WAITING = 'WAITING',
  QUESTION_IN_PROGRESS = 'QUESTION_IN_PROGRESS',
  QUESTION_FINISHED = 'QUESTION_FINISHED',
  FINISHED = 'FINISHED',
}

export interface Game {
  id: string; // = join code
  quiz: Quiz;
  adminId: string;
  status: GameStatus;
  currentQuestionId: string | null;
  players: Player[];
}

export interface Player {
  userId: string;
  alias: string;
  currentAnswerIndex: number | null;
  score: number;
};
