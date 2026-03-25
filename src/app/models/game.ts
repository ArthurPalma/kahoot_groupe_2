import { UserWithAlias } from "../services/user";
import { Quiz } from "./quiz";

export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export enum QuestionStatus {
  WAIT_ANSWER = 'WAIT_ANSWER',
  SHOW_ANSWER = 'SHOW_ANSWER',
  FINISHED = 'FINISHED',
}

export interface Game {
  id: string; // = join code
  quiz: Quiz;
  adminId: string;
  status: GameStatus;
  currentQuestionIndex: number;
  questionStatus: QuestionStatus;
}

export interface Player {
  userId: string;
  alias: string;
  currentAnswerIndex: number | null;
  score: number;
};
