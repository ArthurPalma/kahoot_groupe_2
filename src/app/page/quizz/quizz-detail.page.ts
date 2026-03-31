import { Component, computed, inject, input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  ActionSheetController,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonRadio,
  IonRadioGroup,
  IonImg,
  IonBadge
} from '@ionic/angular/standalone';
import { QuizService } from '../../services/quiz';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  arrowBackOutline, createOutline, stopwatchOutline, trashOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { filter, tap } from 'rxjs';
import { Quiz } from 'src/app/models/quiz';

@Component({
  selector: 'app-quizz-detail',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Détail du quizz : {{ quiz().title }}</ion-title>
        <ion-buttons slot="start">
          <ion-button shape="round" (click)="close()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button shape="round" (click)="edit()" color="primary">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
          <ion-button shape="round" (click)="delete()" color="danger">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title>Détail du quizz : {{ quiz().title }}</ion-title>
          <ion-buttons slot="start">
            <ion-button shape="round" (click)="close()">
              <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button shape="round" (click)="edit()" color="primary">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-button>
            <ion-button shape="round" (click)="delete()" color="danger">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ quiz().title }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {{ quiz().description }}
          </ion-card-content>
        </ion-card>

        @for (question of quiz().questions; track $index) {
          <ion-card class="question-card">
              <ion-badge color="primary" class="ion-margin ion-float-end">
                <ion-icon name="stopwatch-outline"></ion-icon>
                {{ question.timeoutSeconds }}s
              </ion-badge>
            <ion-card-header>
              <ion-card-subtitle>Question {{$index + 1}}</ion-card-subtitle>
              <ion-card-title>
                {{ question.text }}
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              @let imgData = question.image;
              @if (imgData) {
                <div 
                  class="
                    ion-margin
                    ion-padding-horizontal
                    ion-display-flex
                    ion-justify-content-center
                  "
                >
                  <ion-img
                    [src]="imgData"
                    class="ion-margin-horizontal"
                    style="max-height: 300px;"
                  />
                </div>
              }
              <ion-radio-group [value]="question.correctChoiceIndex">
                <ion-list>
                  @for (choice of question.choices; track $index) {
                    <ion-item lines="none">
                      <ion-radio
                        slot="start"
                        [disabled]="true"
                        [value]="$index"
                      ></ion-radio>
                      <ion-label>
                        {{ choice.text }}
                      </ion-label>
                    </ion-item>
                  }
                </ion-list>
              </ion-radio-group>
            </ion-card-content>
          </ion-card>
        }

      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
    IonRadio,
    IonRadioGroup,
    IonImg,
    IonBadge
  ],
})
export class QuizzDetailPage {
  readonly id = input.required<string>({ alias: 'quizId' });

  quizService = inject(QuizService);
  router = inject(Router);
  actionSheetCtrl = inject(ActionSheetController);

  protected readonly quizResource = rxResource({
    stream: ({ params }) =>
      this.quizService.get(params.id).pipe(
        tap(quiz => {
          if (!quiz) {
            this.router.navigate(['/quizzes']);
          }
        }),
        filter((quiz): quiz is Quiz => !!quiz)
      ),
    params: () => ({ id: this.id() }),
    defaultValue: {
      id: '',
      ownerId: '',
      title: '',
      description: '',
      questions: [],
      nbQuestions: 0
    }
  });

  quiz = computed(() => this.quizResource.value());

  constructor() {
    addIcons({
      arrowBackOutline,
      createOutline,
      trashOutline,
      stopwatchOutline
    });
  }

  close() {
    this.router.navigateByUrl('/quizzes');
  }

  edit() {
    // TODO
  }

  async delete() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Confirmer la suppression',
      buttons: [
        {
          text: 'Oui',
          role: 'confirm',
        },
        {
          text: 'Non',
          role: 'cancel',
        },
      ],
    });
    actionSheet.present();
    const { role } = await actionSheet.onWillDismiss();

    if (role === 'confirm') {
      await this.quizService.deleteQuiz(this.id());
      this.router.navigateByUrl('/quizzes');
    }
  }
}
