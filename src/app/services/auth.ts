import { inject, Injectable } from '@angular/core';
import {
  Auth,
  User,
  user,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { UserService } from './user';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  getConnectedUser(): Observable<User | null> {
    return user(this.auth);
  }

  async register(
    email: string,
    password: string,
    alias: string,
  ): Promise<void> {
    try {
      const userCred = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      await this.userService.create({ alias, ...userCred.user });
      await sendEmailVerification(userCred.user);
      return this.logout();
    } catch (error: any) {
      let message = `
        Quelque chose s'est mal passé, veuillez vérifier vos informations 
        ou réessayer plus tard.
      `;
      if (error.code === 'auth/email-already-in-use') {
        message = `
          Cette adresse email est déjà utilisée. Veuillez en choisir une autre.
        `;
      } else if (error.code === 'auth/invalid-email') {
        message = `
          L'adresse email fournie n'est pas valide. 
          Veuillez vérifier et réessayer.
        `;
      }
      const toast = await this.toastController.create({
        message: message,
        duration: 2000
      });
      await toast.present();
    }
  }

  async login(email: string, password: string): Promise<void> {
    let toast: HTMLIonToastElement | undefined;
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigateByUrl('/');
      const userProfile = await firstValueFrom(
        this.userService.getOne(this.auth.currentUser!.uid)
      );
      const name = userProfile?.alias || this.auth.currentUser?.email || '';
      toast = await this.toastController.create({
        message: `Connexion réussie, bienvenue ${name}!`,
        duration: 2000,
      });
    } catch (error) {
      console.error(error);
      console.warn("toto" + error);
      toast = await this.toastController.create({
        message: "Quelque chose s'est mal passé, veuillez vérifier"
          + " vos identifiants ou réessayer plus tard.",
        duration: 2000,
      });
    } finally {
      await toast?.present();
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigateByUrl('/');
  }

  async sendResetPasswordLink(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
    const toast = await this.toastController.create({
      message: 'Un email de réinitialisation de mot de passe a été envoyé.',
      duration: 2000,
    });
    await toast.present();
  }
}
