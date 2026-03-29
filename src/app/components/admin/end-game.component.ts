import { Component, computed, input } from "@angular/core";
import { IonToolbar, IonButton, IonGrid, IonRow, IonCol, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { sparklesOutline, trophyOutline } from "ionicons/icons";
import { Player } from "src/app/models/game";

@Component({
  selector: 'final-table-scores',
  template: `
  <ion-grid class="ion-margin">
    <ion-row>
      <ion-col>
        <ion-text>nom</ion-text>
      </ion-col>
      <ion-col>
        <ion-text>score</ion-text>
      </ion-col>
    </ion-row>

    @for(player of orderedPlayers(); track player.userId) {
      <ion-row>
        <ion-col>
          <ion-text>{{ player.alias }}</ion-text>
        </ion-col>
        <ion-col>
          <ion-text>{{ player.score }}</ion-text>
        </ion-col>
      </ion-row>
    }
  </ion-grid>
  `,
  styles: `
    ion-row {
      border-bottom: 1px solid var(--ion-color-medium);
    }
    ion-row:last-child {
      border-bottom: none;
    }
    ion-row:nth-child(odd) {
      background-color: var(--ion-color-light);
    }
    ion-row:first-child {
      font-weight: bold;
    }
  `,
  imports: [IonGrid, IonRow, IonCol, IonText]
})
export class FinalTableComponent {
  players = input.required<Player[]>();
  orderedPlayers = computed(() =>
    this.players().slice().sort((a, b) => b.score - a.score)
  );
}


@Component({
  selector: 'final-screen',
  template: `
    <ion-card class="ion-text-center" color="warning">
      <ion-card-header>
        @if (winners().length > 1) {
          <ion-card-subtitle>Et les grands gagnants sont...</ion-card-subtitle>
        }
        @else {
          <ion-card-subtitle>Et le grand gagnant est...</ion-card-subtitle>
        }
        <ion-card-title class="ion-margin-vertical">
          <ion-icon name="trophy-outline"></ion-icon>
          {{ winnersStr() }}
          <ion-icon name="sparkles-outline"></ion-icon>
        </ion-card-title>
        <ion-card-subtitle>
          Avec un score de {{ players()[0].score }} points !
          Félicitations !
        </ion-card-subtitle>
      </ion-card-header>
    </ion-card>
    <div
      class="
        ion-margin-horizontal
        ion-text-center
      "
      style="
        border-bottom: 1px solid var(--ion-color-medium);
        padding-bottom: .5rem;
        margin-top: 1.5rem;
      "
    >
      Récapitulatif des résultats
    </div>
    <final-table-scores [players]="players()" />
  `,
  imports: [FinalTableComponent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon]
})
export class FinalScreenComponent {
  players = input.required<Player[]>();
  winners = computed(() => {
    const orderedPlayers = this.players().slice().sort((a, b) => b.score - a.score);
    let winners = orderedPlayers.filter(p => p.score === orderedPlayers[0].score);
    return winners.map(w => w.alias);
  });
  winnersStr = computed(() => {
    if (this.winners().length === 1) return this.winners()[0];
    const aliases = this.winners();
    return `
      ${aliases.slice(0, -1).join(', ')} et ${aliases[aliases.length - 1]}
    `;
  });

  constructor() {
    addIcons({ trophyOutline, sparklesOutline });
  }
}

@Component({
  selector: 'end-game-toolbar',
  template: `
      <ion-toolbar>
        <ion-button
          expand="block"
          size="medium"
          (click)="end()()"
          class="ion-margin-horizontal"
        >
          Terminer le jeu
        </ion-button>
      </ion-toolbar>
    `,
  imports: [IonToolbar, IonButton]
})
export class EndGameToolbarComponent {
  end = input.required<() => void>();
}
