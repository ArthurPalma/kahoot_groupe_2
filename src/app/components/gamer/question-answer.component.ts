import { Component, computed, input } from "@angular/core";
import { Question } from "../../models/question";
import {
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBadge,
  IonProgressBar,
  IonButtons,
  IonImg,
} from "@ionic/angular/standalone";
import { Player } from "../../models/game";
import {
  multi_colors,
  multi_colors_text,
  success_error_colors,
  success_error_text_colors
} from "src/app/models/colors";
import { addIcons } from "ionicons";
import {
  checkmarkCircleOutline,
  checkmarkOutline,
  closeCircleOutline,
  closeOutline,
  stopwatchOutline
} from "ionicons/icons";

@Component({
  selector: 'gamer-question-answer',
  template: `
    <div style="display: flex; flex-direction: column; height: 100%;">
      <ion-card class="ion-padding ion-text-center ion-margin-bottom">
        <ion-card-header>
          <ion-card-title><b>{{ question().text }}</b></ion-card-title>

          @if (question().image) {
            <div class="ion-margin-top" style="max-height: 400px;">
              <div style="display: flex; justify-content: center;">
                <ion-img
                  [src]="question().image"
                  class="ion-margin-horizontal"
                />
              </div>
            </div>
          }
        </ion-card-header>
      </ion-card>

      <div class="ion-text-center" style="margin: .4rem;">
        Score actuel : {{ player()?.score || 0 }} pts
      </div>

      <ion-grid class="ion-display-flex">
        <ion-row class="ion-justify-content-center">
          @for (choice of choices(); track $index) {
            @let isSelected = 
              !hasAnswered() || selectedAnswerIndex() === choice.id;
            <ion-col size="6">
              @let coloridx = (showCorrectAnswer()) ? choice.id : $index;
              <ion-button
                expand="block"
                [style.--background]="choiceColor(coloridx, isSelected)"
                [style.--color]="choiceTextColor(coloridx, isSelected)"
                [disabled]="showCorrectAnswer() || !leftTime()"
                (click)="selectChoice(choice.id)"
              >
                @if (hasAnswered() && selectedAnswerIndex() === choice.id) {
                  <div>
                    <ion-icon slot="icon-only" name="checkmark-outline" />
                  </div>
                }
                {{ choice.text }}
              </ion-button>
            </ion-col>
          }
        </ion-row>
      </ion-grid>

      <div class="ion-text-center ion-padding">
        @if (showCorrectAnswer()) {
          @if (isCorrect()) {
            <div>
              <ion-icon name="checkmark-circle-outline" color="success" />
              <b style="padding-left: 5px;">
                Bonne réponse ! +{{ pointsPerCorrectAnswer() }} pts
              </b>
            </div>
          } @else {
            <div>
              <ion-icon name="close-circle-outline" color="danger"></ion-icon>
              <b style="padding-left: 5px;">
                Mauvaise réponse
              </b>
            </div>
          }
          <div>En attente de la prochaine question...</div>
          <div style="height: 20px;"></div>
        }
      </div>
    </div>
  `,
  styles: `
    ion-button {
      height: 100%;
      margin: 0;
      position: relative;
    }

    ion-button > div {
      position: absolute;
      top: 5%;
      right: 5%;
    }

    ion-grid, ion-row, ion-col { width: 100%; }
  `,
  imports: [
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonImg,
  ]
})
export class QuestionAnswerComponent {
  question = input.required<Question>();
  player = input.required<Player | undefined>();
  setAnswer = input.required<(id: number) => void>();
  showCorrectAnswer = input.required<boolean>();
  pointsPerCorrectAnswer = input.required<number>();
  selectedAnswerIndex = input.required<number | null>();
  leftTime = input.required<boolean>();

  choices = input.required<{ id: number, text: string }[]>();

  hasAnswered = computed(() => this.selectedAnswerIndex() !== null);
  isCorrect = computed(() =>
    this.selectedAnswerIndex() === this.question().correctChoiceIndex
  );

  constructor() {
    addIcons({ checkmarkOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  choiceColor(choiceId: number, isSelected: boolean): string {
    if (!this.showCorrectAnswer()) {
      return multi_colors[choiceId % multi_colors.length] +
        (isSelected ? 'ff' : '99');
    }
    return choiceId === this.question().correctChoiceIndex ?
      success_error_colors[0] : success_error_colors[1];
  }
  choiceTextColor(choiceId: number, isSelected: boolean): string {
    if (!this.showCorrectAnswer()) {
      return multi_colors_text[choiceId % multi_colors_text.length] +
        (isSelected ? 'ff' : '99');
    }
    return choiceId === this.question().correctChoiceIndex ?
      success_error_text_colors[0] : success_error_text_colors[1];
  }

  selectChoice(choiceId: number): void {
    this.setAnswer()(choiceId);
  }
}

@Component({
  selector: 'gamer-question-header',
  template: `
    <ion-header [translucent]="translucent()" [collapse]="collapse()">
      <ion-toolbar>
        <ion-title>{{ title() }}</ion-title>

        @if (timerDuration() >= 0) { 
          <ion-badge slot="end" class="ion-margin-end">
            <ion-icon name="stopwatch-outline"></ion-icon>
            {{ timeLeft() }}s
          </ion-badge>
        }

        <ion-buttons slot="end">
          <ion-button shape="round" (click)="confirmStop()()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      @if (timerDuration() >= 0) { 
        <ion-progress-bar [value]="timeLeft() / timerDuration()" />
      }
    </ion-header>
  `,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBadge,
    IonProgressBar,
    IonIcon,
    IonButtons,
    IonButton
  ],
})
export class QuestionHeader {
  translucent = input<boolean>(false);
  whithConfirm = input<boolean>(false);
  collapse = input<'condense' | 'fade' | undefined>(undefined);
  confirmStop = input.required<() => void>();
  confirmMessage = input<string>('Êtes-vous sûr de vouloir quitter ?');

  title = input.required<string>();

  timerDuration = input.required<number>();
  isQuestionInProgress = input.required<boolean>();
  timeLeft = input.required<number>();

  constructor() {
    addIcons({ stopwatchOutline, closeOutline });
  }
}
