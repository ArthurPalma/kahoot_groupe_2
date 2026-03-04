import { inject, Injectable } from '@angular/core';
import { Quiz } from '../models/quiz';
import { Observable } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
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
        correctChoiceIndex: question.correctChoiceIndex,
      });
    });

    await batch.commit();
  }

  deleteQuiz(quizId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `quizzes/${quizId}`));
  }

  updateQuiz(updatedQuiz: Quiz): Promise<void> {
    // TODO !
    //this.quizzes.next(this.quizzes.value.map((q) =>
    //  q.id === updatedQuiz.id ? updatedQuiz : q
    //));
    return Promise.resolve();
  }
}
