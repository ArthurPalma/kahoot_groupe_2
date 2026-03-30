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
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Html5QrcodeSupportedFormats } from "html5-qrcode";

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
    await this.join(joinCode);
  }

  async join(joinCode: string) {
    try {
      await this.gameService.joinGame(joinCode);
      this.router.navigateByUrl(`/game/${joinCode}`);
    } catch (error: Error | unknown) {
      let toast: HTMLIonToastElement | undefined;
      if (error instanceof Error && error.message === "GAME_NOT_FOUND") {
        toast = await this.toastCtrl.create({
          message: 'Aucun jeu trouvé avec ce code. Veuillez réessayer.',
          duration: 2000,
        })
      } else if (error instanceof Error && error.message === "GAME_ALREADY_STARTED") {
        toast = await this.toastCtrl.create({
          message: 'Ce jeu a déjà commencé. Vous ne pouvez plus le rejoindre.',
          duration: 2000,
        })
      } else {
        console.error("Error joining game:", error);
        toast = await this.toastCtrl.create({
          message: 'Une erreur est survenue. Veuillez réessayer.',
          duration: 2000,
        })
      }
      if (toast) await toast.present();
    }
  }

  async scanQRCode() {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: Html5QrcodeSupportedFormats.QR_CODE,
    });
    await this.join(result.ScanResult);
  }
}
