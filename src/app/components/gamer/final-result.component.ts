import { Component, inject, input } from "@angular/core";
import { Router } from "@angular/router";
import { IonButton, IonList, IonBadge, IonLabel, IonItem, IonText } from "@ionic/angular/standalone";
import { Player } from "src/app/models/game";

@Component({
  selector: 'gamer-final-result',
  template: `
    <div class="ion-padding">
      <h3 class="ion-text-center ion-margin-horizontal">Classement</h3>
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

      <ion-button expand="block" class="ion-margin-top" (click)="goHome()">
      Retour à l'accueil
      </ion-button>
    </div>
  `,
  imports: [
    IonButton,
    IonList,
    IonBadge,
    IonLabel,
    IonItem,
    IonText
  ]
})
export class GamerFinalResultComponent {
  router = inject(Router);
  myUserId = input.required<string>();
  rankedPlayers = input.required<Player[]>();

  goHome() {
    this.router.navigate(['/']);
  }

  medal(index: number): string {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] ? medals[index] : String(index + 1) + '.';
  }
}
