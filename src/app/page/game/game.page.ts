import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game';
import { UserWithAlias } from 'src/app/services/user';

@Component({
  selector: 'app-game',
  template: `
    <ion-content [fullscreen]="true">
      <p>Page du jeu : {{ joinCode() }}</p>
      <p>En attente de joueurs...</p>
      <p>is admin : {{ isAdmin() }}</p>
      <p>Joueurs connectés :</p>
      <ul>
        @for (player of players(); track player.uid) {
          <li>{{ player.uid }} - {{ player.alias }}</li>
        }
      </ul>
    </ion-content>
  `,
  imports: [
    IonContent,
  ],
})
export class GamePage implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router)

  joinCode = signal<string | null>(null);
  isAdmin = signal(false);
  players = signal<UserWithAlias[]>([]);

  ngOnInit() {
    const joinCode = this.route.snapshot.paramMap.get('joinCode');
    if (!joinCode) this.router.navigateByUrl('/quizzes');

    this.joinCode.set(joinCode);

    this.gameService.getGame(joinCode!).subscribe(game => {
      if (!game) {
        this.router.navigateByUrl('/quizzes');
        return;
      }
      this.authService.getConnectedUser().subscribe(user => {
        this.isAdmin.set(game.adminId === user!.uid);
      });
    });

    /*this.gameService.getPlayers(joinCode!).subscribe(players => {
      this.players.set(players);
    });*/
  }
}
