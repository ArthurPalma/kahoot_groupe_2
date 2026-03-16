import { inject, Injectable } from '@angular/core';
import { Quiz } from '../models/quiz';
import { Observable } from 'rxjs';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  doc,
  docData,
  runTransaction,
} from '@angular/fire/firestore';
import { Game, GameStatus, QuestionStatus } from '../models/game';

type GameDAO = Omit<Game, 'id' | 'players' | 'quiz'> & {
  quiz: DocumentReference<DocumentData, DocumentData>;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private firestore: Firestore = inject(Firestore);

  getGame(joinCode: string): Observable<Game | undefined> {
    const docRef = doc(this.firestore, `games/${joinCode}`);
    return docData(docRef) as Observable<Game | undefined>;
  }

  private generateJoinCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async startGame(
    quiz: Quiz,
    codeLength: number = 6,
    maxAttempts: number = 10,
    adminUserId: string,
  ): Promise<string | undefined> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const joinCode = this.generateJoinCode(codeLength);
      const game: GameDAO = {
        quiz: doc(this.firestore, `quizzes/${quiz.id}`),
        status: GameStatus.WAITING,
        currentQuestionIndex: 0,
        questionStatus: QuestionStatus.WAIT_ANSWER,
        adminId: adminUserId
      };

      try {
        // https://firebase.google.com/docs/firestore/manage-data/transactions
        await runTransaction(this.firestore, async (transaction) => {

          // Check if join code already exists
          const docRef = doc(this.firestore, `games/${joinCode}`);
          const docSnap = await transaction.get(docRef);
          if (docSnap.exists()) {
            throw new Error("CODE_EXISTS");
          }

          // If not, create the game
          transaction.set(docRef, game);
        });
        // and return the join code if successful
        return joinCode;
      } catch (error: any) {
        if (error && error.message === "CODE_EXISTS") continue; // try another code

        // re-throw other errors
        throw error;
      }
    }
    return undefined; // failed to generate a unique code after max attempts
  }

  getPlayers(joinCode: string): Observable<Game['players']> {
    // TODO
    return new Observable(subscriber => {
      subscriber.next([]);
    });
  }
}
