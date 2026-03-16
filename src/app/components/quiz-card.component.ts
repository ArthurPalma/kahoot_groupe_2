import { Component, Input } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { Quiz } from 'src/app/models/quiz';
import { addIcons } from 'ionicons';
import { playOutline } from 'ionicons/icons';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz-card',
  template: `
    <ion-col size="auto">
      <ion-card color="medium" [routerLink]="'/quiz/' + quiz.id">
        <ion-card-header>
          <ion-card-title>
            <span class="ion-margin-vertical ion-display-inline-block">
              {{ quiz.title | titlecase }}
            </span>
          </ion-card-title>
          <ion-card-subtitle>{{ quiz.description }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content></ion-card-content>
      </ion-card>
    </ion-col>
  `,
  imports: [
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    TitleCasePipe,
    RouterLink
  ],
})
export class QuizCard {
  @Input() quiz!: Quiz;

  constructor() {
    addIcons({ playOutline });
  }
}
