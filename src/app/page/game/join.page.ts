import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonInput,
  IonButton,
  ToastController,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';
import { GameService } from 'src/app/services/game';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClosePageHeader } from "src/app/components/close-page-header";
import { addIcons } from 'ionicons';
import { keyOutline, qrCodeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-game',
  template: `
    <close-page-header 
      [translucent]="true"
      [action]="goBack"
    >
      Rejoindre un jeu
    </close-page-header>

    <ion-content [fullscreen]="true">
      <close-page-header
        collapse="condense"
        [action]="goBack"
      >
        Rejoindre un jeu
      </close-page-header>

      <div id="container">
        <ion-card class="ion-text-center">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="key-outline"></ion-icon>
              Grâce à un code
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <form [formGroup]="joinCodeForm" (ngSubmit)="joinGame()" novalidate>
              <ion-input
                placeholder="Entrez le code de jeu"
                formControlName="code"
                [errorText]="invalidCode"
                class="ion-margin-bottom"
              ></ion-input>
              <ion-button type="submit" [disabled]="joinCodeForm.invalid">
                Rejoindre le jeu
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        <ion-card class="ion-text-center">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="qr-code-outline"></ion-icon>
              Grâce à un QR Code
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-button type="button" (click)="scanQRCode()">
              Scanner le QR Code
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: `
    #container {
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    
    #container > ion-card {
      margin-bottom: 3rem;
    }`,
  imports: [
    IonContent,
    IonInput,
    IonButton,
    ReactiveFormsModule,
    ClosePageHeader,
    IonCard,
    IonCardTitle,
    IonCardHeader,
    IonCardContent,
    IonIcon
  ],
})
export class GamePage {
  readonly invalidCode = "Le code est requis et d'au moins 4 caractères.";

  private gameService = inject(GameService);
  private toastCtrl = inject(ToastController);
  private readonly fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    addIcons({ qrCodeOutline, keyOutline });
  }

  goBack = () => {
    this.router.navigateByUrl('/quizzes');
  }

  joinCodeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(4)]],
  });

  async joinGame() {
    if (this.joinCodeForm.invalid) return;
    const joinCode = this.joinCodeForm.value.code!;
    try {
      await this.gameService.joinGame(joinCode);
      this.router.navigateByUrl(`/game/${joinCode}`);
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Le code de jeu est invalide. Veuillez réessayer.',
        duration: 2000,
      })
      await toast.present();
    }
  }

  scanQRCode() {
    // TODO
  }
}
