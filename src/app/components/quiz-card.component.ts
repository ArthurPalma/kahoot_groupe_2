import { Component, inject, input, Input } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../services/game';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-quiz-card',
  template: `
    <ion-col size="auto">
      <ion-card color="medium" [routerLink]="'/quiz/' + quiz().id">
        <ion-button class="ion-float-right ion-margin" (click)="launchGame()">
          <ion-icon slot="icon-only" name="play-outline"></ion-icon>
        </ion-button>
        <ion-card-header>
          <ion-card-title>
            <span class="ion-margin-vertical ion-display-inline-block">
              {{ quiz().title | titlecase }}
            </span>
          </ion-card-title>
          <ion-card-subtitle>{{ quiz().description }}</ion-card-subtitle>
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
    RouterLink,
    IonIcon,
    IonButton
  ],
})
export class QuizCard {
  quiz = input.required<Quiz>();

  gameService = inject(GameService);
  router = inject(Router);
  toastController = inject(ToastController);

  constructor() {
    addIcons({ playOutline });
  }

  async launchGame() {
    this.gameService.launchGame(this.quiz(), 10, 15).then(joinCode => {
      if (joinCode) {
        this.router.navigateByUrl(`/game-admin/${joinCode}`);
      } else {
        throw new Error('Impossible de lancer le jeu.');
      }
    }).catch(async () => {
      const toast = await this.toastController.create({
        message: 'Une erreur est survenue lors du lancement du jeu. Veuillez réessayer.',
        duration: 2000
      });
      await toast.present();
    });
  }
}
