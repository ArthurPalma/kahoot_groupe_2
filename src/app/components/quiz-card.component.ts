import { Component, inject, Input } from '@angular/core';
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
import { AuthService } from '../services/auth';
import { GameService } from '../services/game';
import { ToastController } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quiz-card',
  template: `
    <ion-col size="auto">
      <ion-card color="medium" [routerLink]="'/quiz/' + quiz.id">
        <ion-card-header>
          <ion-card-title>
            <span class="ion-margin-vertical ion-display-inline-block">
              {{ quiz.title | titlecase }}
              <ion-button 
              class="ion-float-right ion-margin-start ion-margin-bottom"
              (click)="startGame($event)"
            >
              <ion-icon slot="icon-only" name="play-outline"></ion-icon>
            </ion-button>
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
    RouterLink,
    IonIcon,
    IonButton
  ],
})
export class QuizCard {
  @Input() quiz!: Quiz;

  authService = inject(AuthService);
  gameService = inject(GameService);
  router = inject(Router);
  toastController = inject(ToastController);

  constructor() {
    addIcons({ playOutline });
  }

  async startGame(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const user = await firstValueFrom(this.authService.getConnectedUser());
    const userId = user!.uid;

    this.gameService.startGame(this.quiz, 10, 15, userId).then(joinCode => {
      if (joinCode) {
        this.router.navigateByUrl(`/game/${joinCode}`);
      }
    }).finally(async () => {
      const toast = await this.toastController.create({
        message: 'Une erreur est survenue lors du lancement du jeu. Veuillez réessayer.',
        duration: 2000
      });
      await toast.present();
    });
  }
}
