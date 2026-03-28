import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Game, GameStatus, Player } from '../models/game';
import { Quiz } from '../models/quiz';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private firestore = inject(Firestore);

  /** Écoute la partie en temps réel */
  getGame(joinCode: string): Observable<Game | undefined> {
    const gameRef = doc(this.firestore, `games/${joinCode}`);
    return docData(gameRef, { idField: 'id' }) as Observable<Game | undefined>;
  }

  /** Écoute les joueurs en temps réel */
  getPlayers(joinCode: string): Observable<Player[]> {
    const playersRef = collection(this.firestore, `games/${joinCode}/players`);
    return collectionData(playersRef, { idField: 'id' }) as Observable<Player[]>;
  }

  /** Récupère le quiz de la partie (appel unique) */
  getQuizForGame(joinCode: string): Promise<Quiz | undefined> {
    const gameRef = doc(this.firestore, `games/${joinCode}`);

    return getDoc(gameRef).then((gameResult) => {
      if (!gameResult.exists()) return undefined;

      const gameData = gameResult.data();
      const quizRef = gameData['quiz']; // c'est une référence Firestore

      return getDoc(quizRef).then((quizResult) => {
        if (!quizResult.exists()) return undefined;

        const quizData = quizResult.data() as { title: string; description: string; ownerId: string };
        const questionsRef = collection(this.firestore, `quizzes/${quizResult.id}/questions`);

        return getDocs(questionsRef).then((questionsResult) => {
          const questions = questionsResult.docs.map((questionDoc) => {
            const questionData = questionDoc.data();
            const choicesArray = questionData['choices'] as { text: string }[];

            const choices = choicesArray.map((choice, index) => {
              return {
                id: index,
                text: choice.text,
              };
            });

            return {
              id: questionDoc.id,
              text: questionData['text'],
              correctChoiceIndex: questionData['correctChoiceId'],
              choices: choices,
            };
          });

          const quiz: Quiz = {
            id: quizResult.id,
            title: quizData['title'],
            description: quizData['description'],
            ownerId: quizData['ownerId'],
            questions: questions,
          };

          return quiz;
        });
      });
    });
  }

  /** Enregistre la réponse d'un joueur */
  submitAnswer(
    joinCode: string,
    userId: string,
    questionIndex: number,
    choiceId: number
  ): Promise<void> {
    const answerRef = doc(
      this.firestore,
      `games/${joinCode}/answers/${userId}_${questionIndex}`
    );

    const answerData = {
      choiceId: choiceId,
      answeredAt: Date.now(),
    };

    return setDoc(answerRef, answerData);
  }

  /** Met à jour le score d'un joueur */
  updateScore(
    joinCode: string,
    userId: string,
    newScore: number
  ): Promise<void> {
    const playerRef = doc(
      this.firestore,
      `games/${joinCode}/players/${userId}`
    );

    return updateDoc(playerRef, { score: newScore });
  }
}