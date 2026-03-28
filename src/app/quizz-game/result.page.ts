import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonBadge,
} from '@ionic/angular/standalone';
import { SessionService } from '../services/session';
import { AuthService } from '../services/auth';
import { Player } from '../models/game';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonBadge,
  ],
})
export class ResultPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  joinCode = '';
  myUserId = signal<string>('');
  players = signal<(Player & { id: string })[]>([]);

  myScore() {
    const me = this.players().find((p) => p.id === this.myUserId());
    return me ? me.score : 0;
  }

  rankedPlayers() {
    return [...this.players()].sort((a, b) => b.score - a.score);
  }

  medal(index: number): string {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] ? medals[index] : String(index + 1) + '.';
  }

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    this.joinCode = code !== null ? code : '';

    this.authService.getConnectedUser().subscribe((user) => {
      if (user) this.myUserId.set(user.uid);
    });

    // Écoute les joueurs en temps réel
    this.sessionService.getPlayers(this.joinCode).subscribe((players) => {
      this.players.set(players as (Player & { id: string })[]);
    });
  }

  goHome() {
    this.router.navigateByUrl('/quizzes');
  }
}