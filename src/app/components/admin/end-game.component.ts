import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  viewChild
} from "@angular/core";
import {
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  listOutline,
  sparklesOutline,
  statsChartOutline,
  trophyOutline
} from "ionicons/icons";
import { Player } from "../../models/game";
import Chart from 'chart.js/auto';
import { multi_colors } from "src/app/models/colors";

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

    <div class="ion-margin-horizontal ion-text-center title">
      <ion-icon name="stats-chart-outline"></ion-icon>
      Statistiques
    </div>
    <div class="ion-margin ion-text-center chart-container">
      <canvas #canvas></canvas>
    </div>

    <div class="ion-margin-horizontal ion-text-center title">
      <ion-icon name="list-outline"></ion-icon>
      Récapitulatif des résultats
    </div>
    <final-table-scores [players]="players()" />
  `,
  styles: `
    .title {
      border-bottom: 1px solid var(--ion-color-medium);
        padding-bottom: .5rem;
        margin-top: 1.5rem;
    }
    .chart-container {
      max-height: 250px;
      display: flex;
      justify-content: center;
    }
  `,
  imports: [
    FinalTableComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonIcon
  ]
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

  questionPoints = input.required<number>();
  nbQuestions = input.required<number>();

  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  constructor() {
    addIcons({
      trophyOutline, sparklesOutline, statsChartOutline, listOutline
    });

    effect(() => {
      const canvas = this.canvas();
      if (!canvas) return;
      if (this.chart) this.chart.destroy();

      const maxScore = this.nbQuestions() * this.questionPoints();
      const quarterScore = maxScore / 4;


      const labels = [
        `0 - ${quarterScore}`,
        `${quarterScore} - ${2 * quarterScore}`,
        `${2 * quarterScore} - ${3 * quarterScore}`,
        `${3 * quarterScore} - ${maxScore}`
      ];

      const data = [
        this.players().filter(p => p.score <= quarterScore).length,
        this.players().filter(p => p.score > quarterScore && p.score <= 2 * quarterScore).length,
        this.players().filter(p => p.score > 2 * quarterScore && p.score <= 3 * quarterScore).length,
        this.players().filter(p => p.score > 3 * quarterScore).length
      ];

      this.chart = new Chart(canvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Score',
            data,
            backgroundColor: multi_colors,
            hoverBackgroundColor: multi_colors
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          aspectRatio: 1.75,
          plugins: {
            legend: {
              display: false,
              onClick: () => { /* do nothing */ }
            },
            tooltip: {
              enabled: false
            }
          }
        }
      });
    });
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
