import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../services/session";
import { AuthService } from "../services/auth";
import { Quiz } from "../models/quiz";
import { Question } from "../models/question";
import { interval, Subscription } from "rxjs";
import { IonHeader, IonToolbar, IonTitle, IonBadge, IonProgressBar, IonContent, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonButton } from "@ionic/angular/standalone";

const TIME_PER_QUESTION = 20;
const POINTS_PER_CORRECT_ANSWER = 100;

@Component({
    selector: 'app-question',
    templateUrl: 'question.page.html',
    styleUrls: ['question.page.scss'],
    imports: [IonHeader, IonToolbar, IonTitle, IonBadge, IonProgressBar, IonContent, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonButton],
})

export class QuestionPage implements OnInit, OnDestroy {

    // Les injections de services/routes

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private sessionService = inject(SessionService);
    private authService = inject(AuthService);

    // Variables globales

    sessionCode = '';
    userId = '';
    quiz = signal<Quiz | undefined>(undefined);
    currentQuestionIndex = signal<number>(0);
    timeLeft = signal<number>(TIME_PER_QUESTION);
    selectedChoiceId = signal<number | null>(null);
    score = signal<number>(0);

    //redéclaration pour pouvoir y accéder depuis le HTML
    readonly TIME_PER_QUESTION = TIME_PER_QUESTION;
    readonly POINTS_PER_CORRECT_ANSWER = POINTS_PER_CORRECT_ANSWER;

    private subs = new Subscription();
    private timerSub: Subscription | undefined;

    /*Un computed c'est une variable dont la valeur est calculée automatiquement à partir 
    d'autres signaux. Quand un signal change, le computed se recalcule tout seul.*/

    // retourne la question courante du quiz, ou undefined s'il n'y en a pas
    currentQuestion = computed<Question | undefined>(() => {
        const quiz = this.quiz();
        const idx = this.currentQuestionIndex();
        if (!quiz) return undefined;
        if (!quiz.questions) return undefined;

        return quiz.questions[idx];
    });

    hasAnswered = computed(() => this.selectedChoiceId() !== null);

    isCorrect = computed(() => {
        const question = this.currentQuestion();
        const selected = this.selectedChoiceId();
        if (!question || selected === null) return false;
        return selected === question.correctChoiceIndex;
    });

    choiceColor(choiceId: number): string {
        if (!this.hasAnswered()) return 'primary';

        const question = this.currentQuestion();

        // primary = bleu, success = vert, danger = rouge, medium = gris
        // boutons bleus tant que l'utilisateur n'a pas répondu
        if (!question) return 'primary';

        // bouton vert si bonne réponse, rouge si mauvaise réponse choisie, gris sinon
        if (choiceId === question.correctChoiceIndex) return 'success';

        if (choiceId === this.selectedChoiceId()) return 'danger';

        return 'medium';
    }

    ngOnInit(): void {
        // Récupère le code de session depuis l'URL (/question/ABC123)
        const code = this.route.snapshot.paramMap.get('code');
        this.sessionCode = code !== null ? code : '';

        // Récupère l'uid du joueur connecté
        const authSub = this.authService.getConnectedUser().subscribe((user) => {
            if (user) {
                this.userId = user.uid;
            }
        });
        this.subs.add(authSub);

        // Écoute la session en temps réel
        const sessionSub = this.sessionService.getSession(this.sessionCode).subscribe((session) => {
            if (!session) return;

            // Si la partie est terminée, on va sur la page résultats
            if (session.status === 'finished') {
                this.router.navigateByUrl('/results/' + this.sessionCode);
                return;
            }

            // Si l'admin a changé de question, on met à jour
            const newIndex = session.currentQuestionIndex;
            if (newIndex !== this.currentQuestionIndex()) {
                this.currentQuestionIndex.set(newIndex);
                this.resetForNewQuestion();
            }
        });
        this.subs.add(sessionSub);

        // Charge le quiz une seule fois
        this.sessionService.getQuizForSession(this.sessionCode).then((quiz) => {
            if (quiz) {
                this.quiz.set(quiz);
            }
        });

        // Démarre le timer
        this.startTimer();
    }
    ngOnDestroy(): void {
        this.subs.unsubscribe();
        if (this.timerSub) {
            this.timerSub.unsubscribe();
        }
    }

    selectChoice(choiceId: number) {
        if (this.hasAnswered()) {
            return;
        }

        // on enregistre le choix du joueur
        this.selectedChoiceId.set(choiceId);

        // on arrête le timer
        if (this.timerSub) {
            this.timerSub.unsubscribe();
        }

        // on enregistre la réponse dans Firestore
        this.sessionService.submitAnswer(
            this.sessionCode,
            this.userId,
            this.currentQuestionIndex(),
            choiceId
        ).then(() => {
            // la réponse est bien enregistrée dans Firestore
        });

        // si la réponse est correcte, on met à jour le score
        if (this.isCorrect()) {
            const newScore = this.score() + POINTS_PER_CORRECT_ANSWER;
            this.score.set(newScore);

            this.sessionService.updateScore(
                this.sessionCode,
                this.userId,
                newScore
            ).then(() => {
                // le score est bien mis à jour dans Firestore
            });
        }
    }

    private startTimer() {
        // on remet le timer à 20 secondes
        this.timeLeft.set(TIME_PER_QUESTION);

        // on arrête le timer précédent s'il existe
        if (this.timerSub) {
            this.timerSub.unsubscribe();
        }

        // on crée un nouvel Observable qui émet une valeur toutes les secondes
        this.timerSub = interval(1000).subscribe(() => {
            // on décrémente le timer
            this.timeLeft.update((t) => t - 1);

            // si le timer est à 0 et que le joueur n'a pas répondu
            if (this.timeLeft() === 0 && !this.hasAnswered()) {

                this.selectedChoiceId.set(null);
                if (this.timerSub) {
                    this.timerSub.unsubscribe();
                }
            }
        });
    }

    // On reset le timer à chaque nouvelle question.
    private resetForNewQuestion() {
        // on remet le choix sélectionné à null (pas encore répondu)
        this.selectedChoiceId.set(null);

        // on redémarre le timer
        this.startTimer();
    }

}
