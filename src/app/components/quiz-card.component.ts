import { Component, Input } from '@angular/core';
import {
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { Quiz } from 'src/app/models/quiz';

@Component({
  selector: 'app-quiz-card',
  template: `
    <ion-col size="auto">
      <ion-card color="medium">
        <ion-card-header>
          <ion-card-title>{{ quiz.title }}</ion-card-title>
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
  ],
})
export class QuizCard {
  @Input() quiz!: Quiz;
}
