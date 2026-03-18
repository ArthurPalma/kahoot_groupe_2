import { Component, inject } from '@angular/core';

import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { GameService } from 'src/app/services/game';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  template: `
    <form [formGroup]="joinCodeForm" (ngSubmit)="joinGame()" novalidate>
      <ion-content [fullscreen]="true">
        <ion-input placeholder="Code de jeu" formControlName="code"></ion-input>
        <ion-button type="submit">Rejoindre le jeu</ion-button>
      </ion-content>
    </form>
  `,
  imports: [
    IonContent,
    IonInput,
    IonButton,
    ReactiveFormsModule,
  ],
})
export class GamePage {
  private gameService = inject(GameService);
  private readonly fb = inject(FormBuilder);
  private router = inject(Router);

  joinCodeForm = this.fb.group({
    code: ['', [Validators.required]],
  });

  async joinGame() {
    if (this.joinCodeForm.invalid) return;

    const joinCode = this.joinCodeForm.value.code!;
    try {
      await this.gameService.joinGame(joinCode);
      this.router.navigateByUrl(`/game/${joinCode}`);
    } catch (error) {
      console.error('Erreur lors de la connexion au jeu:', error);
    }
  }
}
