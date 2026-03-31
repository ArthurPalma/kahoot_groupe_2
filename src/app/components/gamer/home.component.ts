import { Component, input } from "@angular/core";
import { BasicGame, Player } from "../../models/game";
import {
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonCardHeader,
  IonCard,
  IonText
} from "@ionic/angular/standalone";

@Component({
  selector: 'gamer-home',
  template: `
    <ion-card class="ion-text-center" color="success ion-padding">
      <ion-card-header>
        <ion-card-title>
          Bienvenue au jeu <b>{{ game()?.quiz?.title }}</b> !
        </ion-card-title>
        <ion-card-subtitle style="font-size: 1rem;">
          <i>{{ game()?.quiz?.description }}</i>
        </ion-card-subtitle>
      </ion-card-header>

      <ion-card-content>
        Nombre de questions : {{ game()?.quiz?.nbQuestions }}
      </ion-card-content>
    </ion-card>

    <div class="ion-text-center ion-padding">
      <p>
        Code de la partie :
      </p>
      <p style="font-weight: bold">
        <ion-text color="primary">{{ joinCode() }}</ion-text>
      </p>
    </div>

    <ion-card class="ion-text-center ion-padding">
      <ion-card-content>
        <p class="ion-padding-bottom" style="font-size: 1.5em;">
          <ion-text color="dark">
            Vous jouez en tant que <b>{{ player()?.alias }}</b>
          </ion-text>
        </p>
        <p class="ion-padding-bottom" >
          Votre score initial est de {{ player()?.score }}.
        </p>
        <p>
          En attente du lancement de la partie par l'administrateur...
        </p>
      </ion-card-content>
    </ion-card>
  `,
  imports: [
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonText
  ],
})
export class GamerHomeComponent {
  game = input.required<BasicGame | undefined>();
  joinCode = input.required<string>();
  player = input.required<Player | undefined>();
}
