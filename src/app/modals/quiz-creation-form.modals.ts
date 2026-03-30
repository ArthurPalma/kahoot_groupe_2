import { Component, inject, Input, signal } from '@angular/core';
import {
  applyEach,
  form,
  FormField,
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
  ToastController,
  IonInput,
  IonItem,
  IonList,
  IonRadio,
  IonIcon,
  IonRadioGroup,
  IonTextarea,
  IonLabel,
  IonRange,
  IonImg,
} from '@ionic/angular/standalone';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { Choice } from '../models/choice';
import { addIcons } from 'ionicons';
import {
  addOutline, imageOutline, removeOutline, trashOutline
} from 'ionicons/icons';
import { FormErrorComponent } from '../components/form-error.component';
import { FilePicker } from '@capawesome/capacitor-file-picker';

type QuizFormModel = Omit<Quiz, "id" | "questions" | "ownerId"> & {
  questions: (
    Omit<Question, "id" | "choices"> & {
      choices: Omit<Choice, "id">[];
    }
  )[];
};

const defaultQuestion = {
  text: '',
  correctChoiceIndex: 0,
  choices: [
    { text: '' },
    { text: '' },
  ],
  image: null,
  timeoutSeconds: 20,
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
    <ion-content [fullscreen]="true" color="light">
      <ion-list [inset]="true">
        <ion-item class="ion-display-flex">
          <ion-label>
            <ion-input
              label="Titre" 
              placeholder="Entrez le titre"
              [formField]="quizForm.title"
            />
            <form-error [state]="quizForm.title()" />
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-textarea
              labelPlacement="stacked"
              label="Description"
              [formField]="quizForm.description"
              placeholder="Entrez une description du quiz"
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

            @let imgData = question.image().value();
            @if (imgData !== null) {
              <div 
                class="
                  ion-margin
                  ion-padding-horizontal
                  ion-display-flex
                  ion-justify-content-center
                "
              >
                <div style="position: relative;" class="ion-margin-horizontal">
                  <ion-img [src]="imgData" style="max-height: 200px;" />
                  <ion-button
                      fill="outline"
                      color="danger"
                      (click)="removeImage(qidx)"
                      style="
                        position: absolute;
                        top: 5%;
                        right: 5%;
                        z-index: 10;
                        background: #fff;
                        border-radius: 15%;
                      "
                    >
                      <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                </div>
              </div>
            }

            <ion-button
              expand="block"
              color="secondary"
              class="ion-margin-horizontal"
              (click)="addImage(qidx)"
            >
              <ion-icon slot="icon-only" name="image-outline" />
              @if (question.image().value()) {
                <span style="margin-left: 0.5rem;">Changer l'image</span>
              } @else {
                <span style="margin-left: 0.5rem;">Ajouter une image</span>
              }
            </ion-button>
            <ion-item class="no-min-height"></ion-item>

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
              <ion-radio slot="end" [value]="idx" color="secondary"></ion-radio>
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
            class="ion-margin-horizontal"
          >
          <ion-icon slot="icon-only" name="add-outline"></ion-icon>
            Ajouter un choix
          </ion-button>

          <ion-item>
            <ion-range 
              min="5" max="180" step="5"
              [formField]="question.timeoutSeconds"
            >
              <div slot="label">Timeout (secondes)</div>
              <div slot="end">{{ question.timeoutSeconds().value() }}s</div>
            </ion-range>
          </ion-item>
        </ion-list>
      }

      <ion-button
        expand="block"
        color="primary"
        (click)="addQuestion()"
        class="ion-margin-horizontal"
      >
        Ajouter une question
      </ion-button>
    </ion-content>
  </form>
  `,
  styles: `
    .no-min-height {
      --min-height: 0px;
    }
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
    IonLabel,
    IonRange,
    IonImg
  ],
})
export class QuizCreationForm {
  @Input() name!: string;

  private modalCtrl = inject(ModalController)
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ removeOutline, imageOutline, addOutline, trashOutline });
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
      ...defaultQuestion
    }],
  });

  addQuestion() {
    this.quizModel.update((quiz) => ({
      ...quiz,
      questions: [
        ...quiz.questions,
        { ...defaultQuestion },
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

  checkPermissions = async () => {
    const result = await FilePicker.checkPermissions();
    return result.readExternalStorage === 'granted' ||
      result.accessMediaLocation === 'granted';
  }

  requestPermissions = async () => {
    const result = await FilePicker.requestPermissions({
      permissions: ['readExternalStorage', 'accessMediaLocation']
    });
    return result.readExternalStorage === 'granted' ||
      result.accessMediaLocation === 'granted';
  }

  pickImage = async () => {
    const result = await FilePicker.pickImages({
      limit: 1,
      readData: true,
    });
    if (result.files.length > 0)
      return `data:${result.files[0].mimeType};base64,${result.files[0].data}`;
    return null;
  }

  addImage = async (questionIndex: number) => {
    if (!await this.checkPermissions()) {
      const granted = await this.requestPermissions();
      if (!granted) {
        const toast = await this.toastCtrl.create({
          message: 'Permission refusée. Impossible d\'ajouter une image.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
        return;
      }
    }

    const result = await this.pickImage();
    if (result) {
      if (result.length > 1000000) { // 1MB
        const toast = await this.toastCtrl.create({
          message: 'L\'image est trop lourde. Veuillez choisir une image de taille inférieure à 1MB.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
        return;
      }

      this.quizModel.update((quiz) => ({
        ...quiz,
        questions: quiz.questions.map((q, idx) =>
          idx === questionIndex
            ? { ...q, image: result }
            : q
        ),
      }));
      this.quizForm().markAsDirty();
    }
  }

  removeImage(questionIndex: number) {
    this.quizModel.update((quiz) => ({
      ...quiz,
      questions: quiz.questions.map((q, idx) =>
        idx === questionIndex
          ? { ...q, image: null }
          : q
      ),
    }));
    this.quizForm().markAsDirty();
  }
}
