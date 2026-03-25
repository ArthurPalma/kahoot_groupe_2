import { Component, inject, input } from '@angular/core';
import {
  ActionSheetController,
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
    <ion-header [translucent]="translucent()" [collapse]="collapse()">
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
  private actionSheetCtrl = inject(ActionSheetController);

  constructor() {
    addIcons({ closeOutline });
  }

  async close() {
    let status: string | undefined;
    if (this.whithConfirm()) {
      const actionSheet = await this.actionSheetCtrl.create({
        header: this.confirmMessage(),
        buttons: [
          {
            text: 'Oui',
            role: 'confirm',
          },
          {
            text: 'Non',
            role: 'cancel',
          },
        ],
      });
      actionSheet.present();
      const { role } = await actionSheet.onWillDismiss();
      status = role;
    }
    if (!this.whithConfirm() || status === 'confirm') {
      this.action()();
    }
  }
}
