import { Component, inject, input } from '@angular/core';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonSpinner,
  IonFooter,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game';
import { Game, Player } from 'src/app/models/game';
import { QRCodeComponent } from 'angularx-qrcode';
import { filter, switchMap, tap } from 'rxjs';
import { addIcons } from 'ionicons';
import { closeOutline, playOutline } from 'ionicons/icons';
import { ClosePageHeader } from "src/app/components/close-page-header";
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-game',
  template: `
    @let noPlayers = players().length === 0;
    <close-page-header 
      [translucent]="true"
      [action]="confirmStop"
      [whithConfirm]="true"
      [confirmMessage]="confirmMessage"
    />

    <ion-content [fullscreen]="true">
      <close-page-header 
        collapse="condense"
        [action]="confirmStop"
        [whithConfirm]="true"
        [confirmMessage]="confirmMessage"
      />

      <ion-card class="ion-text-center">
        <ion-card-header>
          <ion-card-subtitle>{{ game()?.quiz?.title }}</ion-card-subtitle>
          <ion-card-title class="ion-margin-vertical">
            Code du jeu : {{ joinCode() }}
          </ion-card-title>
          <ion-card-subtitle>{{ game()?.quiz?.description }}</ion-card-subtitle>
        </ion-card-header>
      </ion-card>
      
      <div class="ion-text-center ion-margin-vertical">
        <qrcode
          [qrdata]="joinCode()"
          [width]="224" 
          [errorCorrectionLevel]="'L'"
        ></qrcode>

        <ion-item>
          <ion-label>Joueurs connectés ({{ players().length }})</ion-label>
          <ion-spinner name="crescent"></ion-spinner>
        </ion-item>
      </div>
      <ul>
        @for (player of players(); track player.userId) {
          <li>{{ player.alias }}</li>
        }
      </ul>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-button
          expand="block"
          size="medium"
          (click)="startGame()"
          class="ion-margin-horizontal"
          [disabled]="noPlayers"
        >
          Démarrer le jeu
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  imports: [
    IonContent,
    QRCodeComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonSpinner,
    IonFooter,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    ClosePageHeader
  ],
})
export class GameAdminPage {
  private gameService = inject(GameService);
  private router = inject(Router)

  joinCode = input<string>('');
  private joinCode$ = toObservable(this.joinCode);

  game = toSignal(
    this.joinCode$.pipe(
      filter(code => !!code), // attendre qu'il soit défini
      switchMap(code => this.gameService.getGame(code)),
      tap(game => {
        if (!game) {
          this.router.navigateByUrl('/quizzes');
        }
      }),
      filter((game): game is Game => !!game)
    )
  );
  players = toSignal(
    this.joinCode$.pipe(
      filter(code => !!code),
      switchMap(code => this.gameService.getPlayers(code))
    ),
    { initialValue: [] }
  );

  constructor() {
    addIcons({ playOutline, closeOutline });
  }

  startGame() {
    // TODO
  }

  readonly confirmMessage = "Voulez-vous vraiment arrêter le jeu ?";
  confirmStop() {
    // TODO
  }
}
