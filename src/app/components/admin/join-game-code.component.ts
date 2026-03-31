import { Component, computed, input } from "@angular/core";
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToolbar,
  IonButton
} from "@ionic/angular/standalone";
import { QRCodeComponent } from "angularx-qrcode";
import { Player } from "../../models/game";

@Component({
  selector: 'join-game-code',
  template: `
    <ion-card class="ion-text-center">
      <ion-card-header>
        <ion-card-subtitle>{{ title() }}</ion-card-subtitle>
        <ion-card-title class="ion-margin-vertical">
          Code du jeu : <b>{{ joinCode() }}</b>
        </ion-card-title>
        <ion-card-subtitle>{{ description() }}</ion-card-subtitle>
      </ion-card-header>
    </ion-card>
    
    <div class="ion-text-center ion-margin-vertical">
      <qrcode
        [qrdata]="joinCode()"
        [width]="224" 
        [errorCorrectionLevel]="'L'"
      ></qrcode>

      <ion-item>
        <ion-label>Joueurs connectés ({{ connectedPlayers().length }})</ion-label>
        <ion-spinner name="crescent"></ion-spinner>
      </ion-item>
    </div>
    <ul>
      @for (player of connectedPlayers(); track player.userId) {
        <li>{{ player.alias }}</li>
      }
    </ul>
    `,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    QRCodeComponent,
    IonItem,
    IonLabel,
    IonSpinner
  ]
})
export class JoinGameCodeComponent {
  joinCode = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  players = input.required<Player[]>();

  connectedPlayers = computed(() =>
    this.players().filter(p => !p.isDisconnected)
  );
}

@Component({
  selector: 'join-game-code-toolbar',
  template: `
      <ion-toolbar>
        <ion-button
          expand="block"
          size="medium"
          (click)="start()()"
          class="ion-margin-horizontal"
          [disabled]="!isPlayer()"
        >
          Démarrer le jeu
        </ion-button>
      </ion-toolbar>
    `,
  imports: [IonToolbar, IonButton]
})
export class JoinGameCodeToolbarComponent {
  isPlayer = input.required<boolean>();
  start = input.required<() => void>();
}
