import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonInput,
  IonTitle,
  IonItem,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <ion-header [translucent]="true">
        <ion-toolbar>
          <ion-title>S'authentifier</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content [fullscreen]="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">S'authentifier</ion-title>
          </ion-toolbar>
        </ion-header>
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
                  ></ion-input>
                </ion-item>
                <ion-item class="ion-margin-bottom">
                  <ion-input
                    type="password"
                    formControlName="password"
                    fill="solid"
                    label="Mot de passe"
                    labelPlacement="floating"
                  ></ion-input>
                </ion-item>
                <p class="ion-text-center">
                  Mot de passe oublié ?
                  <a routerLink="/password-retrieve">Récupérez-le ici</a>
                </p>
              </ion-list>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col class="ion-margin-start ion-margin-end">
              <ion-button
                class="ion-margin-bottom ion-margin-top"
                expand="block"
                type="submit"
                [disabled]="loginForm.invalid"
              >
                Se connecter
              </ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <p class="ion-text-center">
                Pas encore de compte ?
                <a routerLink="/register">Inscrivez-vous ici</a>
              </p>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </form>
  `,
  imports: [
    IonButton,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonInput,
    IonList,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  invalidEmailText = 'Entrez une adresse email valide';
  invalidPasswordText = 'Le mot de passe contient au moins 6 caractères';

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.minLength(6), Validators.required]],
  });

  onSubmit() {
    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!);
  }
}
