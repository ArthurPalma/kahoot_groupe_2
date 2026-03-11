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
} from '@angular/fire/firestore';
import { Observable, switchMap, of } from 'rxjs';
import { Quiz } from '../models/quiz';

export interface Session { 
    quizId : string;
    status : 'pending' | 'started' | 'finished';
    currentQuestionIndex : number;
}

export interface Participant {
    pseudo : string;
    score : number;
}

@Injectable({
  providedIn: 'root',
})

export class SessionService {
  private firestore = inject(Firestore);

  getSession(sessionCode: string): Observable<Session | undefined> {
    const ref = doc(this.firestore, `sessions/${sessionCode}`);
    return docData(ref) as Observable<Session | undefined>;
  }


  /*
  Cette méthode récupère le quiz associé à une session donnée.
  */
  getQuizForSession(sessionCode: string): Promise<Quiz | undefined> {
    const sessionRef = doc(this.firestore, `sessions/${sessionCode}`);
    
    return getDoc(sessionRef).then((resultSession) => {
      if (!resultSession.exists()) return undefined;
      
      const session = resultSession.data() as Session;
      const quizRef = doc(this.firestore, `quizzes/${session.quizId}`);
      
      return getDoc(quizRef).then((quizResult) => {
        if (!quizResult.exists()) return undefined;

        const quizData = quizResult.data();

        const quiz: Quiz = {
          id: quizResult.id,
          title: quizData['title'],
          description: quizData['description'],
          questions: quizData['questions'],
        };

        return quiz;
      });
    });
  }

  getParticipants(sessionCode: string): Observable<Participant[]> {
    const participantsRef = collection(
      this.firestore,
      `sessions/${sessionCode}/participants`
    );

    return collectionData(participantsRef, { idField: 'id' }) as Observable<Participant[]>;
  }

  submitAnswer( sessionCode: string, userId: string, questionIndex: number, choiceId: number ): Promise<void> {
    
    const answerRef = doc(
      this.firestore,
      `sessions/${sessionCode}/answers/${userId}_${questionIndex}`
    );

    const answerData = {
      choiceId: choiceId,
      answeredAt: Date.now(),
    };

    return setDoc(answerRef, answerData);
  }

  // Pour mettre à jour le score d'un participant lors d'une session donnée
  updateScore(sessionCode: string, userId: string, newScore: number): Promise<void> {
    const participantRef = doc(
      this.firestore,
      `sessions/${sessionCode}/participants/${userId}`
    );

    const updatedData = {
      score: newScore,
    };

    return updateDoc(participantRef, updatedData);
  }

}