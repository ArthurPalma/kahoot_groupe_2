import { Component, inject } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { PageHeader } from "../../components/page-header";

@Component({
  selector: 'app-register',
  template: ` <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
    <page-header [translucent]="true">Inscription</page-header>

    <ion-content [fullscreen]="true">
      <page-header [collapse]="'condense'">Inscription</page-header>

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
              <ion-item class="ion-margin-bottom">
                <ion-input
                  formControlName="alias"
                  fill="solid"
                  label="Pseudo"
                  labelPlacement="floating"
                  placeholder="Entrer un pseudo"
                  type="text"
                  [errorText]="invalidAliasText"
                ></ion-input>
              </ion-item>
              <ion-item class="ion-margin-bottom">
                <ion-input
                  type="password"
                  formControlName="password"
                  fill="solid"
                  label="Password"
                  labelPlacement="floating"
                  minlength="6"
                  [errorText]="invalidPasswordText"
                ></ion-input>
              </ion-item>
              <ion-item class="ion-margin-bottom">
                <ion-input
                  type="password"
                  formControlName="passwordConfirm"
                  fill="solid"
                  label="Password Confirmation"
                  labelPlacement="floating"
                  [errorText]="invalidPasswordConfirmText"
                ></ion-input>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button
              class="ion-margin-bottom ion-margin-start ion-margin-end"
              [disabled]="registerForm.invalid" 
              expand="block"
              type="submit"
            >Register</ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <p class="ion-text-center">
              Déjà un compte ?
              <a routerLink="/login">Connectez-vous ici</a>
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
    RouterLink,
    ReactiveFormsModule,
    PageHeader
  ],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  invalidEmailText = 'Entrez une adresse email valide';
  invalidAliasText = 'Le pseudo est requis et doit contenir au moins 3 caractères';
  invalidPasswordText = 'Le mot de passe doit contenir au moins 6 caractères';
  invalidPasswordConfirmText = 'Les mots de passe ne correspondent pas';

  registerForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    alias: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.minLength(6), Validators.required]],
    passwordConfirm: ['', [Validators.required, passwordConfirmMatchPasswordValidator()]],
  });

  onSubmit() {
    const { email, password, alias } = this.registerForm.value;
    this.authService.register(email!, password!, alias!);
  }
}

export function passwordConfirmMatchPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controls = control.parent?.controls as {
      [key: string]: AbstractControl | null;
    };

    const password = controls ? controls['password']?.value : null;
    const passwordConfirm = control?.value;

    return passwordConfirm === password
      ? null
      : { passwordConfirmMissmatch: true };
  };
}
