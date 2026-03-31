import { inject, Injectable } from '@angular/core';
import { BasicQuiz, Quiz } from '../models/quiz';
import {
  catchError,
  combineLatest,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap
} from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDocs,
  query,
  where,
  writeBatch
} from '@angular/fire/firestore';
import { AuthService } from './auth';
import { Question } from '../models/question';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  getMyQuizzes(): Observable<Quiz[]> {
    return this.authService.getConnectedUser().pipe(
      filter(user => user !== null),
      switchMap(user => {
        const quizzesCollectionRef = collection(this.firestore, 'quizzes');
        const q = query(quizzesCollectionRef, where('ownerId', '==', user.uid));

        return collectionData(q, { idField: 'id' }) as Observable<Quiz[]>;
      })
    );
  }

  get(quizId: string): Observable<Quiz | undefined> {
    const quizDocRef = doc(this.firestore, `quizzes/${quizId}`);
    const questionsRef = collection(this.firestore, `quizzes/${quizId}/questions`);

    return combineLatest([
      docData(quizDocRef, { idField: 'id' }),
      collectionData(questionsRef, { idField: 'id' })
    ]).pipe(
      map(([quiz, questions]) => {
        if (!quiz) return undefined;
        return {
          ...((quiz as any)),
          questions
        }
      }),
      map(doc => {
        if (!doc) return undefined;
        const quiz = doc as Quiz;
        quiz.questions.sort((a, b) => a.questionNumber - b.questionNumber);
        return quiz;
      }),
      catchError((error) => {
        console.error(`Error fetching quiz with id ${quizId}:`, error);
        return of(undefined); // if i'm not the owner of the quiz
      })
    );
  }

  getBasic(quizId: string): Observable<BasicQuiz | undefined> {
    return this.get(quizId).pipe(
      filter(quiz => !!quiz),
      map(quiz => ({
        id: quiz!.id,
        title: quiz!.title,
        description: quiz!.description,
        nbQuestion: quiz!.questions.length
      }))
    );
  }

  getQuestion(
    quizId: string, questionId: string
  ): Observable<Question | undefined> {
    const questionDocRef =
      doc(this.firestore, `quizzes/${quizId}/questions/${questionId}`);
    return docData(
      questionDocRef, { idField: 'id' }
    ) as Observable<Question | undefined>;
  }

  async addQuiz(quiz: Quiz): Promise<void> {
    const uid = (
      await firstValueFrom(this.authService.getConnectedUser())
    )!.uid;
    const batch = writeBatch(this.firestore);

    // QUIZ
    const quizzesCollectionRef = collection(this.firestore, 'quizzes');
    const quizId = doc(quizzesCollectionRef).id;

    batch.set(doc(quizzesCollectionRef, quizId), {
      title: quiz.title,
      description: quiz.description,
      ownerId: uid,
    });

    // QUESTIONS
    const questionCollectionRef =
      collection(this.firestore, `quizzes/${quizId}/questions`);

    quiz.questions.map(question => {
      const questionId = doc(questionCollectionRef).id;
      batch.set(doc(this.firestore, `quizzes/${quizId}/questions/${questionId}`), {
        text: question.text,
        choices: question.choices,
        correctChoiceIndex: question.correctChoiceIndex,
        image: question.image,
        timeoutSeconds: question.timeoutSeconds,
        questionNumber: question.questionNumber
      });
    });

    await batch.commit();
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    const questionsRef = collection(this.firestore, `quizzes/${quizId}/questions`);
    (await getDocs(questionsRef)).forEach(q => { batch.delete(q.ref); });
    batch.delete(doc(this.firestore, `quizzes/${quizId}`));

    await batch.commit();
  }

  updateQuiz(updatedQuiz: Quiz): Promise<void> {
    // TODO !
    //this.quizzes.next(this.quizzes.value.map((q) =>
    //  q.id === updatedQuiz.id ? updatedQuiz : q
    //));
    return Promise.resolve();
  }
}
