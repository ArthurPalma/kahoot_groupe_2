import { inject, Injectable } from '@angular/core';
import { Quiz } from '../models/quiz';
import { Observable } from 'rxjs';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  writeBatch
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private firestore: Firestore = inject(Firestore);

  getAll(): Observable<Quiz[]> {
    const quizzesCollectionRef = collection(this.firestore, 'quizzes');
    return collectionData(quizzesCollectionRef, {
      idField: 'id',
    }) as Observable<Quiz[]>;
  }

  get(quizId: string): Observable<Quiz | undefined> {
    const quizDocRef = doc(this.firestore, `quizzes/${quizId}`);
    return docData(quizDocRef, {
      idField: 'id',
    }) as Observable<Quiz | undefined>;
  }

  async addQuiz(quiz: Quiz): Promise<void> {
    const batch = writeBatch(this.firestore);

    // QUIZ
    const quizzesCollectionRef = collection(this.firestore, 'quizzes');
    const quizId = doc(quizzesCollectionRef).id;

    batch.set(doc(quizzesCollectionRef, quizId), {
      title: quiz.title,
      description: quiz.description,
    });

    // QUESTIONS
    const questionCollectionRef =
      collection(this.firestore, `quizzes/${quizId}/questions`);

    quiz.questions.map(question => {
      const questionId = doc(questionCollectionRef).id;
      batch.set(doc(this.firestore, `quizzes/${quizId}/questions/`, questionId), {
        text: question.text,
        choices: question.choices,
        correctChoiceId: question.correctChoiceId,
      });
    });

    await batch.commit();
  }

  deleteQuiz(quizId: string): Promise<void> {
    //this.quizzes.next(this.quizzes.value.filter((q) => q.id !== quizId));
    return Promise.resolve();
  }

  updateQuiz(updatedQuiz: Quiz): Promise<void> {
    //this.quizzes.next(this.quizzes.value.map((q) =>
    //  q.id === updatedQuiz.id ? updatedQuiz : q
    //));
    return Promise.resolve();
  }
}
