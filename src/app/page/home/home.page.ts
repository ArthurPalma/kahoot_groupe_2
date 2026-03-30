import { Component, inject } from '@angular/core';
import { IonContent, IonGrid, IonRow, IonCol, IonButton, IonFab, IonFabButton, IonIcon, ModalController, IonLabel, IonItem } from '@ionic/angular/standalone';
import { QuizService } from '../../services/quiz';
import { AsyncPipe } from '@angular/common';
import { QuizCard } from "../../components/quiz-card.component";
import { addIcons } from 'ionicons';
import { add, gameControllerOutline, playOutline } from 'ionicons/icons';
import { QuizCreationForm } from '../../modals/quiz-creation-form.modals';
import { PageHeader } from "../../components/page-header";

@Component({
  selector: 'app-home',
  template: `
    <page-header [translucent]="true">Kahoot!</page-header>

    <ion-content [fullscreen]="true">
      <page-header [collapse]="'condense'">Kahoot!</page-header>

      <ion-item lines="full">
        <ion-label>
          <p>Rejoignez des quiz avec 
            <ion-icon name="game-controller-outline"></ion-icon>
            ou créez les vôtres avec 
            <ion-icon name="add"></ion-icon>
            puis en lançant le jeu avec 
            <ion-icon name="play-outline"></ion-icon>
            .
          </p>
        </ion-label>
      </ion-item>

      @let _quizzes = quizzes | async;
      <div id="container">
        <ion-grid>
          <ion-row class="ion-align-items-center ion-justify-content-center">
            @for(quiz of _quizzes; track quiz.id) {
              <ion-col size="6">
                 <app-quiz-card [quiz]="quiz" />
              </ion-col>
            } @empty {
              <ion-col class="ion-text-center">
                <p>Aucun quiz créé pour le moment.</p>
                <ion-button (click)="openCreateModal()">
                  Créer votre premier quiz
                </ion-button>
              </ion-col>
            }
          </ion-row>
        </ion-grid>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openCreateModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  `,
  styleUrls: ['home.page.scss'],
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    AsyncPipe,
    QuizCard,
    PageHeader,
    IonLabel,
    IonItem
  ],
})
export class HomePage {
  private quizService = inject(QuizService);
  private modalCtrl = inject(ModalController);

  quizzes = this.quizService.getMyQuizzes();

  constructor() {
    addIcons({
      add, gameControllerOutline, playOutline
    });
  }

  async openCreateModal() {
    const modal = await this.modalCtrl.create({
      component: QuizCreationForm,
      componentProps: { name: `Création d'un Quiz` },
    });
    modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (data && role === 'confirm') {
      await this.quizService.addQuiz(data);
    }
  }
}
