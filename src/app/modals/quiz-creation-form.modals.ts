import { Component, inject, Input, signal } from '@angular/core';
import {
  applyEach,
  form,
  FormField,
  max,
  min,
  minLength,
  required,
  validate
} from '@angular/forms/signals';
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
  IonLabel
} from '@ionic/angular/standalone';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { Choice } from '../models/choice';
import { addIcons } from 'ionicons';
import { removeOutline } from 'ionicons/icons';
import { FormErrorComponent } from '../components/form-error.component';

type QuizFormModel = Omit<Quiz, "id" | "questions" | "ownerId"> & {
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
          <ion-button color="medium" (click)="cancel()">Annuler</ion-button>
        </ion-buttons>
        <ion-title class="ion-text-center">{{ name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            type="submit"
            [strong]="true"
            [disabled]="quizForm().invalid()"
          >
            Créer
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" [fullscreen]="true" color="light">
      <ion-list [inset]="true">
        <ion-item class="ion-display-flex">
          <ion-label>
            <ion-input
              label="Titre" 
              placeholder="Entrez le texte de la question"
              [formField]="quizForm.title"
            />
            <form-error [state]="quizForm.title()" />
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-textarea
              labelPlacement="stacked"
              label="Entrez une description pour votre quiz"
              [formField]="quizForm.description"
              placeholder="Devinez la capitale de différents pays à travers le monde."
            ></ion-textarea>
            <form-error [state]="quizForm.description()" />
          </ion-label>
        </ion-item>
      </ion-list>

      @for(
        question of quizForm.questions;
        track $index;
        let qidx = $index;
      ) {
        <ion-list [inset]="true" style="padding-bottom: 0px !important;">
          <ion-item>
            <ion-label>
              <ion-input
                [label]="'Question ' + (qidx + 1)" 
                placeholder="Entrez le texte de la question"
                [formField]="question.text"
              />
              <form-error [state]="question.text()" />
            </ion-label>
            @if (quizForm.questions.length > 1) {
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
          ) {
            <ion-item>
              <ion-label>
                <ion-input 
                  [label]="'Choix ' + (idx + 1)"
                  placeholder="Entrez le texte du choix" 
                  [formField]="choice.text"
                />
                <form-error [state]="choice.text()" />
              </ion-label>
              <ion-radio slot="end" [value]="idx"></ion-radio>
              @if (question.choices.length > 2) {
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

          <ion-button
            expand="block"
            color="secondary"
            (click)="addChoice(qidx)"
          >
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
    FormErrorComponent,
    IonLabel
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

  quizForm = form(this.quizModel, (s) => {
    required(s.title, { message: 'Le titre est requis' });
    minLength(s.title, 4, { message: 'Le titre doit contenir au moins 4 caractères' });

    required(s.description, { message: 'La description est requise' });
    minLength(s.description, 10, { message: 'La description doit contenir au moins 10 caractères' });

    minLength(s.questions, 1);
    applyEach(s.questions, (item) => {

      required(item.text, { message: 'Le texte de la question est requis' });
      minLength(item.text, 4, { message: 'Le texte de la question doit contenir au moins 4 caractères' });

      required(item.correctChoiceIndex);
      min(item.correctChoiceIndex, 0);
      validate(item, (question) => { // max
        if (question.value().correctChoiceIndex >= question.value().choices.length) {
          return {
            kind: 'invalidCorrectChoiceIndex',
            message: 'L\'index de la bonne réponse est invalide'
          };
        }

        return null;
      });

      minLength(item.choices, 2);
      applyEach(item.choices, (choice) => {
        required(choice.text, { message: 'Le texte du choix est requis' });
      });
    });
  });
}
