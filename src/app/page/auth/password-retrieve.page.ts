import { Component, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import {
  IonButton,
  IonContent,
  IonInput,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { PageHeader } from "../../components/page-header";

@Component({
  selector: 'app-password-retrieve',
  template: ` <form [formGroup]="passwordRetrieveForm" (ngSubmit)="onSubmit()">
    <page-header [translucent]="true">Mot de passe oublié</page-header>

    <ion-content [fullscreen]="true">
      <page-header [collapse]="'condense'">Mot de passe oublié</page-header>
      
      <ion-grid>
          <ion-row>
            <ion-col>
              <ion-list lines="none">
                <ion-item class="ion-margin-bottom">
                  <ion-input
                    formControlName="email"
                    fill="solid"
                    label="Email"
                    labelPlacement="floating"
                    placeholder="utilisateur@exemple.com"
                    type="email"
                    [errorText]="invalidEmailText"
                  ></ion-input>
                </ion-item>
              </ion-list>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
            <ion-button
              expand="block"
              type="submit"
              [disabled]="passwordRetrieveForm.invalid"
              class="ion-margin-bottom ion-margin-start ion-margin-end"
            >Envoyer l'email</ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <p class="ion-text-center">
                Pour retourner à la page de connexion, <a routerLink="/login">cliquez ici</a>.
              </p>
            </ion-col>
          </ion-row>
        </ion-grid>
    </ion-content>
  </form>`,
  imports: [
    IonButton,
    IonContent,
    IonInput,
    IonList,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    ReactiveFormsModule,
    RouterLink,
    PageHeader
  ],
})
export class PasswordRetrievePage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  invalidEmailText = 'Veuillez entrer une adresse email valide.';

  passwordRetrieveForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
  });

  onSubmit() {
    this.authService.sendResetPasswordLink(
      this.passwordRetrieveForm.value.email!
    );
  }
}
