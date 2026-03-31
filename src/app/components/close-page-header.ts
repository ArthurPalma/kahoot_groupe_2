import { Component, inject, input } from '@angular/core';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'close-page-header',
  template: `
    <ion-header [translucent]="translucent()" [collapse]="collapse()"  style="padding: 5px;">
      <ion-toolbar>
        <ion-title> <ng-content /> </ion-title>

        <ion-buttons slot="end">
          <ion-button shape="round" (click)="close()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon],
})
export class ClosePageHeader {
  readonly translucent = input<boolean>(false);
  readonly whithConfirm = input<boolean>(false);
  readonly collapse = input<'condense' | 'fade' | undefined>(undefined);
  readonly action = input.required<() => void>();
  readonly confirmMessage = input<string>('Êtes-vous sûr de vouloir quitter ?');

  private readonly router = inject(Router);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ closeOutline });
  }

  async close() {
    if (this.whithConfirm()) {
      const alert = await this.alertCtrl.create({
        header: this.confirmMessage(),
        buttons: [
          {
            text: 'Oui',
            role: 'confirm',
            handler: () => {
              this.action()();
            },
          },
          {
            text: 'Non',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
    } else {
      this.action()();
    }
  }
}
