import { Component, computed, inject, input, signal } from '@angular/core';
import { IonContent, IonSpinner, IonFooter } from "@ionic/angular/standalone";
import { GameService } from '../../services/game';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, interval, map, switchMap, tap } from 'rxjs';
import { BasicGame, GameStatus, Player } from '../../models/game';
import { GamerHomeComponent } from "../../components/gamer/home.component";
import { AuthService } from '../../services/auth';
import {
  QuestionAnswerComponent, QuestionHeader
} from "../../components/gamer/question-answer.component";
import { QUESTION_POINTS } from './game-admin.page';
import {
  GamerFinalResultComponent, GamerFinalToolbarComponent
} from "../../components/gamer/final-result.component";

@Component({
  selector: 'app-game',
  template: `
    @let totalQ = game()?.quiz?.nbQuestions || 0;
    @let qNumber = game()?.currentQuestionNumber || 0;
    @let duration = status() === questionInProgress ? timerDuration() : -1;
    @let Qmessage = 
      (status() === questionInProgress || status() === questionFinished) ? 
        'Question ' + qNumber + ' / ' + totalQ : 
        '';
    <gamer-question-header 
      [translucent]="true"
      [confirmStop]="confirmStop"
      [timerDuration]="duration"
      [title]="Qmessage"
      [isQuestionInProgress]="status() === questionInProgress"
      [timeLeft]="timerLeft()"
    />

    <ion-content [fullscreen]="true">
      <gamer-question-header 
        collapse="condense"
        [timerDuration]="duration"
        [confirmStop]="confirmStop"
        [title]="Qmessage"
        [isQuestionInProgress]="status() === questionInProgress"
        [timeLeft]="timerLeft()"
      />

      @if (status() === waiting) {
        <gamer-home
          [game]="game()"
          [joinCode]="joinCode()"
          [player]="player()"
        />
      } @else if (status() === questionInProgress || status() === questionFinished) {
        @let cQuestion = currentQuestion();
        @if (cQuestion) {
          <gamer-question-answer
            [question]="cQuestion"
            [setAnswer]="setAnswer"
            [showCorrectAnswer]="status() === questionFinished"
            [player]="player()"
            [pointsPerCorrectAnswer]="pointsPerQuestion"
            [selectedAnswerIndex]="player()?.currentAnswerIndex ?? null"
            [leftTime]="timerLeft() > 0"
            [choices]="currentChoice()"
          />
        } @else {
          <div class="ion-padding">
            <p class="ion-margin-bottom">
              Chargement de la question en cours...
            </p>
            <ion-spinner></ion-spinner>
          </div>
        }
      } @else if (status() === finished) {
        <gamer-final-result
          [rankedPlayers]="rankedPlayers()"
          [myUserId]="player()?.userId || ''"
        />
      }
    </ion-content>
    @if (status() === finished) {
      <ion-footer>
        <gamer-final-toolbar />
      </ion-footer>
    }
  `,
  imports: [
    QuestionHeader,
    IonContent,
    GamerHomeComponent,
    QuestionAnswerComponent,
    IonSpinner,
    GamerFinalResultComponent,
    IonFooter,
    GamerFinalToolbarComponent,
  ],
})
export class GamePage {
  joinCode = input<string>('');
  private joinCode$ = toObservable(this.joinCode);

  readonly pointsPerQuestion = QUESTION_POINTS;

  private authService = inject(AuthService);
  private gameService = inject(GameService);
  private router = inject(Router);

  game = toSignal(
    this.joinCode$.pipe(
      filter(code => !!code), // attendre qu'il soit défini
      switchMap(code => this.gameService.getBasicGame(code)),
      tap(game => {
        if (!game) {
          this.router.navigateByUrl('/quizzes');
        }
      }),
      filter((game): game is BasicGame => !!game)
    )
  );

  player = toSignal(
    this.authService.getConnectedUser().pipe(
      filter(user => !!user),
      switchMap(user => this.gameService.getPlayer(this.joinCode(), user!.uid)),
      tap(player => {
        if (!player) {
          this.router.navigateByUrl('/quizzes');
        }
      }),
      filter((player): player is Player => !!player)
    )
  );

  setAnswer = async (choiceId: number) => {
    await this.gameService.setPlayerAnswer(
      this.joinCode(), this.player()!.userId, choiceId
    );
  };

  readonly waiting = GameStatus.WAITING;
  readonly questionInProgress = GameStatus.QUESTION_IN_PROGRESS;
  readonly questionFinished = GameStatus.QUESTION_FINISHED
  readonly finished = GameStatus.FINISHED;
  status = computed(() => this.game()?.status || GameStatus.WAITING);

  oldQuestionNum: number | null = null;
  currentQuestion = toSignal(
    toObservable(this.game).pipe(
      filter(
        game => !!game &&
          game.status !== GameStatus.WAITING &&
          (
            game.currentQuestionNumber !== this.oldQuestionNum ||
            this.oldQuestionNum === null
          )
      ),
      switchMap(game =>
        this.gameService.getQuestion(game!.quiz.id, game!.currentQuestionId!)
      ),
      tap(q => {
        this.oldQuestionNum = this.game()?.currentQuestionNumber || null;
        this.timerLeft.set(q?.timeoutSeconds || 0);
      })
    )
  );
  currentChoice = computed(() => this.currentQuestion()?.choices
    .map((choice, index) => ({
      id: index,
      text: choice.text
    }))
    .sort((a, b) => Math.random() - 0.5) || []
  );

  timerDuration = computed(() => this.currentQuestion()?.timeoutSeconds || 0);
  timerLeft = signal<number>(0);

  constructor() {
    interval(1000).subscribe(() => {
      if (this.timerLeft() <= 0) {
        this.timerLeft.update(_ => 0);
      } else {
        this.timerLeft.update(left => left - 1);
      }
    });
  }

  rankedPlayers = toSignal(
    toObservable(this.status).pipe(
      filter(status => status === GameStatus.FINISHED),
      switchMap(_ => this.gameService.getPlayers(this.joinCode())),
      map(players => players.slice().sort((a, b) => b.score - a.score))
    ),
    { initialValue: [] }
  );

  confirmStop = () => {
    this.gameService.leaveGame(this.joinCode());
    this.router.navigateByUrl('/quizzes');
  }
}
