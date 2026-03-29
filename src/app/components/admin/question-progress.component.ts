import { Component, computed, input, signal } from "@angular/core";
import { IonToolbar, IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonItem, IonLabel, IonCardContent, IonGrid, IonRow, IonCol, IonText, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";
import { interval } from 'rxjs';
import { Player } from "src/app/models/game";
import { Question } from "src/app/models/question";

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
}

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
  remainingTime = signal(20);
  resetRemainingTime = computed(() => {
    this.remainingTime.set(this.timerDuration());
  });

  btnDisabled = computed(() => this.remainingTime() > 0 && !this.allAnswersIn());
  btnMessage = computed(() => {
    if (this.remainingTime() <= 0 || this.allAnswersIn()) {
      return 'Afficher la réponse';
    } else {
      return `Afficher la réponse (${this.remainingTime()}s)`;
    }
  });

  constructor() {
    interval(1000).subscribe(() => {
      if (this.timerDuration() > 0) {
        this.remainingTime.update((v) => v - 1);
      }
    });
  }
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
