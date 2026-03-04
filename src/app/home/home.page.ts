import { Component, inject } from '@angular/core';
import { 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent, 
  IonGrid,
  IonRow,
  IonFab,
  IonFabButton,
  IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz';
import { AsyncPipe } from '@angular/common';
import { QuizCard } from "../components/quiz-card.component";
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { QuizCreationForm } from '../components/quiz-creation-form.component';

@Component({
  selector: 'app-home',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>
          Kahoot!
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Kahoot!</ion-title>
        </ion-toolbar>
      </ion-header>

      @let _quizzes = quizzes | async;
      <div id="container">
        <ion-grid>
          <ion-row class="ion-align-items-center ion-justify-content-center">
            @for(quiz of _quizzes; track quiz.id) {
              <app-quiz-card [quiz]="quiz" />
            }
          </ion-row>
        </ion-grid>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  `,
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonFab,
    IonFabButton,
    IonIcon,
    AsyncPipe,
    QuizCard,
],
})
export class HomePage {
  private quizService = inject(QuizService);
  private modalCtrl = inject(ModalController);
  
  quizzes = this.quizService.getAll();

  constructor() {
    addIcons({
      add,
    });
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: QuizCreationForm,
    });
    modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (data && role === 'confirm') {
      console.log('New Quiz:', data);

      await this.quizService.addQuiz(data);
    }
  }
}
