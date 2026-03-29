import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  viewChild
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";
import { interval, map } from 'rxjs';
import { Player } from "../../models/game";
import { Question } from "../../models/question";
import { Chart } from 'chart.js/auto';



// -----------------------------------------------------------------------------

@Component({
  selector: 'player-with-score',
  template: `
  <ion-grid class="ion-margin">
    <ion-row>
      <ion-col>
        <ion-text>nom</ion-text>
      </ion-col>
      <ion-col>
        <ion-text>réponse</ion-text>
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
          <ion-text>
            @if (showCurrentAnswer()) {
              {{ 
                player.currentAnswerIndex !== null ?
                  player.currentAnswerIndex + 1 : '-' 
              }}
              @if (player.currentAnswerIndex === correctAnswerIndex()) {
                <ion-icon name="checkmark-circle-outline" color="success" />
              } @else {
                <ion-icon name="close-circle-outline" color="danger" />
              }
            } @else {
              {{ player.currentAnswerIndex !== null ? 'oui' : 'non' }}
            }
            
          </ion-text>
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
  imports: [IonGrid, IonRow, IonCol, IonText, IonIcon]
})
export class PlayerWithScoreComponent {
  players = input.required<Player[]>();
  showCurrentAnswer = input.required<boolean>();
  correctAnswerIndex = input.required<number>();

  orderedPlayers = computed(() => {
    if (this.showCurrentAnswer()) {
      return this.players().slice().sort((a, b) => b.score - a.score);
    } else {
      return this.players().slice().sort((a, b) => {
        if (a.currentAnswerIndex !== null && b.currentAnswerIndex === null) {
          return -1;
        } else if (b.currentAnswerIndex !== null && a.currentAnswerIndex === null) {
          return 1;
        } else {
          return b.score - a.score;
        }
      });
    }
  });

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline });
  }
}


// -----------------------------------------------------------------------------

@Component({
  selector: 'question-progress',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title class="ion-margin-vertical">
          Question : {{ question().text }}
        </ion-card-title>
      </ion-card-header>

      <ion-card-content>
        Réponses possibles :
        <ol>
          @for (choice of question().choices; track $index) {
            @if (!showAnswer()) {
              <li>{{ choice.text }}</li>
            } @else if ($index === question().correctChoiceIndex) {
              <li class="correct">{{ choice.text }}</li>
            } @else {
              <li class="incorrect">{{ choice.text }}</li>
            }
          }
        </ol>
      </ion-card-content>
    </ion-card>

    <div class="ion-margin ion-text-center">
      <canvas #canvas></canvas>
    </div>
    
    <player-with-score
      [players]="players()"
      [showCurrentAnswer]="showAnswer()"
      [correctAnswerIndex]="question().correctChoiceIndex"
    />
    `,
  styles: `
    .correct {
      color: var(--ion-color-success);
      font-weight: bold;
    }
    .incorrect {
      color: var(--ion-color-danger);
    }
  `,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    PlayerWithScoreComponent
  ]
})
export class QuestionProgressComponent {
  question = input.required<Question>();
  players = input.required<Player[]>();
  showAnswer = input.required<boolean>();

  playersWhoAnswered = computed(() =>
    this.players().filter(p => p.currentAnswerIndex !== null)
  );

  playersWhoDidntAnswer = computed(() =>
    this.players().filter(p => p.currentAnswerIndex === null)
  );

  // chart 
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  chartConfig = computed(() => {
    if (!this.showAnswer()) {
      const colors = ['#42d96b', '#cb1a27'];
      return {
        type: 'pie' as const,
        data: {
          labels: ['Ont répondu', 'N\'ont pas répondu'],
          datasets: [{
            data: [
              this.playersWhoAnswered().length,
              this.playersWhoDidntAnswer().length
            ],
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            hoverOffset: 0
          }]
        },
        options: {}
      };
    } else {
      const colors = [
        '#f94144',
        '#f9c74f',
        '#90be6d',
        '#277da1',
        '#f3722c',
        '#43aa8b',
        '#f8961e',
        '#577590',
        '#4d908e',
        '#f9844a',
      ];

      const labels = this.question().choices
        .map((_, i) => "" + (i + 1))
        .concat('-');

      const data = [
        ...this.question().choices.map((_, i) =>
          this.players().filter(p => p.currentAnswerIndex === i).length
        ),
        this.playersWhoDidntAnswer().length
      ];

      return {
        type: 'bar' as const,
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            hoverOffset: 0
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0
              }
            }
          }
        }
      };
    }
  });

  constructor() {
    effect(() => {
      const canvas = this.canvas();
      if (!canvas) return;
      if (this.chart) this.chart.destroy();

      this.chart = new Chart(canvas.nativeElement, {
        ...this.chartConfig(),
        options: {
          ...this.chartConfig().options,
          aspectRatio: 1.75,
          plugins: {
            legend: {
              display: this.chartConfig().type !== 'bar',
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

// -----------------------------------------------------------------------------

@Component({
  selector: 'question-show-answer-toolbar',
  template: `
      <ion-toolbar>
        <ion-button
          expand="block"
          size="medium"
          (click)="showAnswer()()"
          class="ion-margin-horizontal"
          [disabled]="btnDisabled()"
        >
          {{ btnMessage() }}
        </ion-button>
      </ion-toolbar>
    `,
  imports: [IonToolbar, IonButton]
})

export class QuestionShowAnswerToolbarComponent {
  showAnswer = input.required<() => void>();
  allAnswersIn = input.required<boolean>();

  timerDuration = input.required<number>();
  tick = toSignal(interval(1000).pipe(
    map(value => value + 1),
  ), { initialValue: 0 });

  remainingTime = computed(() => Math.max(0, this.timerDuration() - this.tick()));

  btnDisabled = computed(() => this.remainingTime() > 0 && !this.allAnswersIn());
  btnMessage = computed(() => {
    if (this.remainingTime() <= 0 || this.allAnswersIn()) {
      return 'Afficher la réponse';
    } else {
      return `Afficher la réponse (${this.remainingTime()}s)`;
    }
  });
}

@Component({
  selector: 'question-next-toolbar',
  template: `
      <ion-toolbar>
        <ion-button
          expand="block"
          size="medium"
          (click)="next()()"
          class="ion-margin-horizontal"
        >
          {{ message() }}
        </ion-button>
      </ion-toolbar>
    `,
  imports: [IonToolbar, IonButton]
})

export class QuestionNextToolbarComponent {
  next = input.required<() => void>();
  message = input.required<string>();
}
