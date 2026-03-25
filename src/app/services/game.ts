import { inject, Injectable } from '@angular/core';
import { Quiz } from '../models/quiz';
import { filter, firstValueFrom, map, Observable, switchMap } from 'rxjs';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  runTransaction,
  setDoc,
} from '@angular/fire/firestore';
import { Game, GameStatus, Player, QuestionStatus } from '../models/game';
import { AuthService } from './auth';
import { UserService } from './user';
import { QuizService } from './quiz';

type GameDAO = Omit<Game, 'quiz'> & {
  quiz: DocumentReference<DocumentData, DocumentData>;
}
type GameDAOWithoutId = Omit<GameDAO, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private quizService = inject(QuizService);

  getGame(joinCode: string): Observable<Game | undefined> {
    const docRef = doc(this.firestore, `games/${joinCode}`);
    const gameDAO = docData(docRef, { idField: 'id' }) as Observable<GameDAO | undefined>;

    return gameDAO.pipe(
      filter(game => game !== undefined),
      switchMap(game => {
        return this.quizService.get(game!.quiz.id).pipe(
          filter(quiz => quiz !== undefined),
          map(quiz => {
            return {
              ...game!,
              quiz
            }
          })
        );
      })
    );
  }

  private generateJoinCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async launchGame(
    quiz: Quiz,
    codeLength: number = 6,
    maxAttempts: number = 10
  ): Promise<string | undefined> {
    const adminUser = await firstValueFrom(this.authService.getConnectedUser());
    const adminUID = adminUser!.uid;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const joinCode = this.generateJoinCode(codeLength);
      const game: GameDAOWithoutId = {
        quiz: doc(this.firestore, `quizzes/${quiz.id}`),
        status: GameStatus.WAITING,
        currentQuestionIndex: 0,
        questionStatus: QuestionStatus.WAIT_ANSWER,
        adminId: adminUID,
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

  getPlayers(joinCode: string): Observable<Player[]> {
    const playersCollectionRef = collection(this.firestore, `games/${joinCode}/players`);
    return collectionData(playersCollectionRef, { idField: 'id' }) as Observable<Player[]>;
  }

  async joinGame(joinCode: string): Promise<void> {
    const user = await firstValueFrom(this.authService.getConnectedUser());
    const userId = user!.uid;
    const userProfile = await firstValueFrom(this.userService.getOne(userId));
    const alias = userProfile?.alias || 'Unknown';


    // check if game exists
    const gameDocRef = doc(this.firestore, `games/${joinCode}`);
    const gameSnap = await firstValueFrom(docData(gameDocRef));
    if (!gameSnap) {
      throw new Error("GAME_NOT_FOUND");
    }

    // add player to game
    const playerRef = doc(this.firestore, `games/${joinCode}/players/${userId}`);
    await setDoc(playerRef, {
      userId,
      alias,
      currentAnswerIndex: null,
      score: 0,
    });
  }
}
