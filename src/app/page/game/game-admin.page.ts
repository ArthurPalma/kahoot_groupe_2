import { Component, computed, inject, input, signal } from '@angular/core';
import { IonContent, IonFooter } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { GameService } from '../../services/game';
import { Game, GameStatus } from '../../models/game';
import { filter, switchMap, tap } from 'rxjs';
import { addIcons } from 'ionicons';
import { closeOutline, playOutline } from 'ionicons/icons';
import { ClosePageHeader } from "../../components/close-page-header";
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  JoinGameCodeComponent, JoinGameCodeToolbarComponent
} from '../../components/admin/join-game-code.component';
import {
  QuestionProgressComponent,
  QuestionNextToolbarComponent,
  QuestionShowAnswerToolbarComponent
} from "../../components/admin/question-progress.component";
import {
  EndGameToolbarComponent, FinalScreenComponent
} from "src/app/components/admin/end-game.component";

export const QUESTION_POINTS = 10;

@Component({
  selector: 'app-game',
  template: `
    @let nbQuestions = game()?.quiz?.questions?.length || 0;
    @let qindex = questionIndex();
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

      @if (qindex === -1) {
        <join-game-code
          [joinCode]="joinCode()"
          [title]="game()?.quiz?.title || '...'"
          [description]="game()?.quiz?.description || '...'"
          [players]="players()"
        />
      }
      @else if (qindex >= 0 && qindex < nbQuestions) {
          <question-progress
            [question]="game()!.quiz.questions[qindex]"
            [players]="players()"
            [showAnswer]="questionFinished()"
          />
      }
      @else {
        <final-screen
          [players]="players()"
          [questionPoints]="pointsPerQuestion"
          [nbQuestions]="nbQuestions"
        />
      }
    </ion-content>
    <ion-footer>
      @if (qindex === -1) {
        <join-game-code-toolbar 
          [isPlayer]="!noPlayer()" 
          [start]="step"
        />
      }
      @else if (qindex >= 0 && qindex < nbQuestions) {
        @if (!questionFinished()) {
          <question-show-answer-toolbar
            [showAnswer]="computeScore"
            [timerDuration]="game()!.quiz.questions[qindex].timeoutSeconds"
            [allAnswersIn]="players().every(p => p.currentAnswerIndex !== null)"
          />
        } @else {
          <question-next-toolbar [next]="step" [message]="stepMessage()" />
        }
      }
      @else {
        <end-game-toolbar [end]="confirmStop" />
      }
    </ion-footer>
  `,
  imports: [
    IonContent,
    IonFooter,
    ClosePageHeader,
    JoinGameCodeComponent,
    JoinGameCodeToolbarComponent,
    QuestionShowAnswerToolbarComponent,
    QuestionNextToolbarComponent,
    QuestionProgressComponent,
    EndGameToolbarComponent,
    FinalScreenComponent
  ],
})
export class GameAdminPage {
  private gameService = inject(GameService);
  private router = inject(Router);

  joinCode = input<string>('');
  private joinCode$ = toObservable(this.joinCode);

  questionIndex = computed(() => {
    const game = this.game();
    if (!game || game.status === GameStatus.WAITING)
      return -1;
    else if (game.status === GameStatus.FINISHED)
      return game.quiz.questions.length;
    else
      return game.quiz.questions
        .findIndex(q => q.id === game.currentQuestionId);
  });

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
  noPlayer = computed(() =>
    this.players().length === 0 ||
    this.players().filter(p => !p.isDisconnected).length === 0
  );
  questionFinished = computed(() =>
    this.game()?.status === GameStatus.QUESTION_FINISHED
  );

  readonly pointsPerQuestion = QUESTION_POINTS;

  constructor() {
    addIcons({ playOutline, closeOutline });
  }

  step = () => {
    if (this.game()!.quiz.questions.length === this.questionIndex() + 1) {
      this.gameService.endGame(this.joinCode());
    } else {
      const qid = this.game()!.quiz.questions[this.questionIndex() + 1].id;
      this.gameService.startOrNextQuestion(
        this.joinCode(), qid, this.questionIndex() + 2
      );
    }
  }
  computeScore = () => {
    if (this.game()!.status === GameStatus.QUESTION_IN_PROGRESS) {
      this.gameService.finishQuestionAndComputeScores(
        this.joinCode(),
        QUESTION_POINTS,
        this.game()!.quiz.questions[this.questionIndex()].correctChoiceIndex
      );
    }
  }
  stepMessage = computed(() => {
    if (this.game()!.quiz.questions.length === this.questionIndex() + 1) {
      return "Afficher les résultats finaux";
    } else {
      return "Passer à la question suivante";
    }
  });

  readonly confirmMessage = "Voulez-vous vraiment arrêter le jeu ?";
  confirmStop = () => {
    this.gameService.removeGame(this.joinCode())
    this.router.navigateByUrl('/quizzes');
  }
}
