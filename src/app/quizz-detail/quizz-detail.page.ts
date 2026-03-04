import { Component, inject, input, Input, OnInit, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz';

@Component({
  selector: 'app-quizz-detail',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>TA</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">TI</ion-title>
        </ion-toolbar>
      </ion-header>
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class QuizzDetailPage {
  id = input.required<string>();

  quizService = inject(QuizService);


}
