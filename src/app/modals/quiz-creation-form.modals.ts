import { Component, inject, Input, signal } from '@angular/core';
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
  IonRadio,
  IonIcon,
  IonRadioGroup,
  IonTextarea,
} from '@ionic/angular/standalone';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { Choice } from '../models/choice';
import { addIcons } from 'ionicons';
import { removeOutline } from 'ionicons/icons';

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
        <ion-title class="ion-text-center">{{ name }}</ion-title>
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
          <ion-input 
            [formField]="quizForm.title" 
            label="Titre" 
            placeholder="Capitales du monde" />
        </ion-item>
        <ion-item>
          <ion-textarea
            labelPlacement="stacked"
            label="Entrez une description pour votre quiz"
            [formField]="quizForm.description"
            placeholder="Devinez la capitale de différents pays à travers le monde."
          ></ion-textarea>
        </ion-item>
      </ion-list>

      @for(
        question of quizForm.questions;
        track $index;
        let qidx = $index;
        let qfirst = $first;
      ) {
        <ion-list [inset]="true" style="padding-bottom: 0px !important;">
          <ion-item>
            <ion-input
              [label]="'Question ' + ($index + 1)" 
              placeholder="Entrez le texte de la question"
              [formField]="question.text"
            />
            @if (!qfirst) {
              <ion-button
                fill="clear"
                slot="end"
                color="medium"
                (click)="removeQuestion(qidx)"
              >
                <ion-icon name="remove-outline"></ion-icon>
              </ion-button>
            }
          </ion-item>

          <ion-radio-group [formField]="question.correctChoiceIndex">
          @for(
            choice of question.choices;
            track $index;
            let idx = $index;
             let first = $first;
          ) {
            <ion-item>
              <ion-input 
                [label]="'Choix ' + ($index + 1)"
                placeholder="Entrez le texte du choix" 
                [formField]="choice.text"
              />
              <ion-radio slot="end" [value]="idx"></ion-radio>
              @if (!first) {
                <ion-button
                  fill="clear"
                  slot="end"
                  color="medium"
                  (click)="removeChoice(qidx, idx)"
                >
                  <ion-icon name="remove-outline"></ion-icon>
                </ion-button>
              } @else {
                <span slot="end" style="width: 2rem;"></span>
              }
            </ion-item>
          }
          </ion-radio-group>

          <ion-button expand="block" color="secondary" (click)="addChoice($index)">
            Ajouter un choix
          </ion-button>
        </ion-list>
      }

      <ion-button expand="block" color="primary" (click)="addQuestion()">
        Ajouter une question
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
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonRadio,
    IonRadioGroup,
    IonTextarea,
    FormField,
  ],
})
export class QuizCreationForm {
  @Input() name!: string;

  private modalCtrl = inject(ModalController)

  constructor() {
    addIcons({ removeOutline });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(event: Event) {
    event.preventDefault();
    return this.modalCtrl.dismiss(this.quizForm().value(), 'confirm');
  }

  // ---------------------------------------------------------------------------

  quizModel = signal<QuizFormModel>({
    title: '',
    description: '',
    questions: [{
      text: '',
      correctChoiceIndex: 0,
      choices: [
        { text: '' },
      ],
    }],
  });

  addQuestion() {
    this.quizModel.update((quiz) => ({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: '',
          correctChoiceIndex: 0,
          choices: [
            { text: '' },
          ],
        },
      ],
    }));
    this.quizForm().markAsDirty();
  }

  removeQuestion(questionIndex: number) {
    this.quizModel.update((quiz) => ({
      ...quiz,
      questions: quiz.questions.filter((_, idx) => idx !== questionIndex),
    }));
    this.quizForm().markAsDirty();
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
    this.quizForm().markAsDirty();
  }

  removeChoice(questionIndex: number, choiceIndex: number) {
    this.quizModel.update((quiz) => ({
      ...quiz,
      questions: quiz.questions.map((q, idx) =>
        idx === questionIndex
          ? {
            ...q,
            choices: q.choices.filter((_, cidx) => cidx !== choiceIndex),
            correctChoiceIndex: q.correctChoiceIndex > choiceIndex
              ? q.correctChoiceIndex - 1
              : q.correctChoiceIndex === choiceIndex
                ? 0
                : q.correctChoiceIndex,
          }
          : q
      ),
    }));
    this.quizForm().markAsDirty();
  }

  quizForm = form(this.quizModel, (schemaPath) => {
    required(schemaPath.description, { message: 'Description is required' });
    required(schemaPath.title, { message: 'Title is required' });
    // TODO : required on questions
    // TODO : required on choices
    // TODO : correctChoiceIndex must be in [0 ; choices.length [.
  });
}
