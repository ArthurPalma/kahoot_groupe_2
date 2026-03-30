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
  getDocs,
  runTransaction,
  setDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Game, GameStatus, Player } from '../models/game';
import { AuthService } from './auth';
import { UserService } from './user';
import { QuizService } from './quiz';

type GameDAO = Omit<Game, 'quiz' | 'players'> & {
  quiz: DocumentReference<DocumentData, DocumentData>;
}


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
    const playersCollectionRef = collection(this.firestore, `games/${joinCode}/players`);
    const players$ = collectionData(playersCollectionRef, { idField: 'id' }) as Observable<Player[]>;

    return gameDAO.pipe(
      filter(game => game !== undefined),
      switchMap(game => {
        return this.quizService.get(game!.quiz.id).pipe(
          filter(quiz => quiz !== undefined),
          switchMap(quiz => {
            return players$.pipe(
              map(players => {
                return {
                  id: game!.id,
                  quiz: quiz!,
                  adminId: game!.adminId,
                  status: game!.status,
                  currentQuestionId: game!.currentQuestionId,
                  players
                } as Game;
              })
            );
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
      const game = {
        quiz: doc(this.firestore, `quizzes/${quiz.id}`),
        status: GameStatus.WAITING,
        currentQuestionId: null,
        adminId: adminUID
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
    const alias = userProfile?.alias || 'Pirate #' + userId.substring(0, 5);

    // check if game exists
    const gameDocRef = doc(this.firestore, `games/${joinCode}`);
    const gameSnap =
      await firstValueFrom(docData(gameDocRef)) as GameDAO | undefined;
    if (!gameSnap) {
      throw new Error("GAME_NOT_FOUND");
    } else if (gameSnap.status !== GameStatus.WAITING) {
      throw new Error("GAME_ALREADY_STARTED");
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

  async startOrNextQuestion(gameId: string, questionId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    batch.set(gameDocRef, {
      status: GameStatus.QUESTION_IN_PROGRESS,
      currentQuestionId: questionId,
    }, { merge: true });

    const playersCollectionRef = collection(this.firestore, `games/${gameId}/players`);
    (await getDocs(playersCollectionRef)).forEach(p => {
      batch.set(p.ref, {
        currentAnswerIndex: null,
      }, { merge: true });
    });

    await batch.commit();
  }

  async finishQuestionAndComputeScores(
    gameId: string, questionPoints: number, correctChoiceIndex: number
  ): Promise<void> {
    const batch = writeBatch(this.firestore);

    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    batch.set(gameDocRef, {
      status: GameStatus.QUESTION_FINISHED,
    }, { merge: true });

    const playersCollectionRef = collection(this.firestore, `games/${gameId}/players`);
    (await getDocs(playersCollectionRef)).forEach(p => {
      const pData = p.data() as Player;
      const newScore = pData.currentAnswerIndex === correctChoiceIndex
        ? pData.score + questionPoints
        : pData.score;
      batch.set(p.ref, {
        score: newScore,
      }, { merge: true });
    });

    await batch.commit();
  }

  async endGame(gameId: string): Promise<void> {
    const gameDocRef = doc(this.firestore, `games/${gameId}`);
    await setDoc(gameDocRef, {
      status: GameStatus.FINISHED,
    }, { merge: true });
  }

  async removeGame(gameId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    const questionsRef = collection(this.firestore, `games/${gameId}/players`);
    (await getDocs(questionsRef)).forEach(p => { batch.delete(p.ref); });
    batch.delete(doc(this.firestore, `games/${gameId}`));

    await batch.commit();
  }
}
