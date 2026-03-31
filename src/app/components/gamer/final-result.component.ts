import { Component, inject, input } from "@angular/core";
import { Router } from "@angular/router";
import {
  IonButton,
  IonList,
  IonBadge,
  IonLabel,
  IonItem,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { Player } from "src/app/models/game";

@Component({
  selector: 'gamer-final-result',
  template: `
    <div class="ion-padding-top">
      <ion-card color="warning" class="ion-text-center ion-margin-horizontal">
        <ion-card-header>
          <ion-card-title><b>Classement</b></ion-card-title>
        </ion-card-header>
      </ion-card>
    </div>
    <div class="ion-padding">
      <ion-list>
        @for (player of rankedPlayers(); track $index) {
          @let bg = player.userId === myUserId() ? 'light' : undefined;
          <ion-item [color]="bg">
              <ion-label>
                <strong>{{ medal($index) }} {{ player.alias }}</strong>
                @if (player.userId === myUserId()) {
                  <ion-text color="medium"> (toi)</ion-text>
                }
              </ion-label>
              @let color = $index === 0 ? 'warning' : 'medium';
              <ion-badge slot="end" [color]="color">
                {{ player.score }} pts
              </ion-badge>
          </ion-item>
        }
      </ion-list>
    </div>
  `,
  imports: [
    IonList,
    IonBadge,
    IonLabel,
    IonItem,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
  ]
})
export class GamerFinalResultComponent {
  router = inject(Router);
  myUserId = input.required<string>();
  rankedPlayers = input.required<Player[]>();

  medal(index: number): string {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] ? medals[index] : String(index + 1) + '.';
  }
}

@Component({
  selector: 'gamer-final-toolbar',
  template: `
    <ion-toolbar>
      <ion-button 
        expand="block"
        size="medium"
        (click)="goHome()"
        class="ion-margin-horizontal"
      >
        Retour à l'accueil
      </ion-button>
    </ion-toolbar>
  `,
  imports: [IonButton, IonToolbar],
})
export class GamerFinalToolbarComponent {
  router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }
}
