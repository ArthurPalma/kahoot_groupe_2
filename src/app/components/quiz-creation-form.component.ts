import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  ModalController,
  IonInput,
  IonItem,
  IonList,
  IonTextarea,
} from '@ionic/angular/standalone';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { Choice } from '../models/choice';

type QuizFormModel = Omit<Quiz, "id" | "questions"> & {
  questions: (
    Omit<Question, "id" | "choices"> & {
      choices: Omit<Choice, "id">[];
    }
  )[];
};

@Component({
  selector: 'app-quiz-creation-form',
  template: `
  <form (submit)="confirm($event)" novalidate>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button color="medium" (click)="cancel()">Cancel</ion-button>
        </ion-buttons>
        <ion-title>Création d'un Quiz</ion-title>
        <ion-buttons slot="end">
          <ion-button type="submit" [strong]="true" [disabled]="quizForm().invalid()">
            Confirm
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" [fullscreen]="true" color="light">
      <ion-list [inset]="true">
        <ion-item>
          <ion-input [formField]="quizForm.title" label="Title" placeholder="Enter title" />
        </ion-item>
        <ion-item>
          <ion-textarea [formField]="quizForm.description" label="Description" placeholder="Enter description" />
        </ion-item>
      </ion-list>

      @for(question of quizModel().questions; track $index) {
        <ion-list [inset]="true" style="padding-bottom: 0px !important;">
          <ion-item>
            <ion-input [label]="'Question ' + ($index + 1)" placeholder="Enter question text" />
          </ion-item>

          @for(choice of question.choices; track $index) {
            <ion-item>
              <ion-input [label]="'Choice ' + ($index + 1)" placeholder="Enter choice text" />
            </ion-item>
          }

          <ion-button expand="block" color="secondary" (click)="addChoice($index)">
            Add Choice
          </ion-button>
        </ion-list>
      }

      <ion-button expand="block" color="primary" (click)="addQuestion()">
        Add Question
      </ion-button>
    </ion-content>
  </form>
  `,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonList,
    IonTextarea,
    FormField
  ],
})
export class QuizCreationForm {
  name!: string;

  private modalCtrl = inject(ModalController)

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(event: Event) {
    event.preventDefault();
    return this.modalCtrl.dismiss(this.quizForm().value(), 'confirm');
  }

  addQuestion() {
    this.quizModel.update((quiz) => ({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: '',
          correctChoiceId: 0,
          choices: [
            { text: '' },
          ],
        },
      ],
    }));
  }

  addChoice(questionIndex: number) {
    this.quizModel.update((quiz) => ({
      ...quiz,
      questions: quiz.questions.map((q, idx) =>
        idx === questionIndex
          ? {
              ...q,
              choices: [...q.choices, { text: '' }],
            }
          : q
      ),
    }));
  }

  quizModel = signal<QuizFormModel>({
    title: '',
    description: '',
    questions: [],
  });

  quizForm = form(this.quizModel, (schemaPath) => {
    required(schemaPath.description, { message: 'Description is required' });
    required(schemaPath.title, { message: 'Title is required' });
    // todo : required on questions
  });
}
