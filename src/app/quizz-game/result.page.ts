import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonTitle, IonContent, IonButton,
  IonCard, IonCardHeader, IonCardTitle,
  IonList, IonItem, IonLabel, IonBadge,
} from '@ionic/angular/standalone';
import { SessionService, Participant } from '../services/session';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['result.page.scss'],
  imports: [
    IonHeader, IonTitle, IonContent, IonButton,
    IonCard, IonCardHeader, IonCardTitle,
    IonList, IonItem, IonLabel, IonBadge,
  ],
})
export class ResultPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  sessionCode = '';
  myUserId = signal<string>('');
  participants = signal<(Participant & { id: string })[]>([]);

  myScore() {
    const me = this.participants().find((p) => p.id === this.myUserId());
    return me ? me.score : 0;
  }

  rankedParticipants() {
    return [...this.participants()].sort((a, b) => b.score - a.score);
  }

  medal(index: number): string {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] ? medals[index] : String(index + 1) + '.';
  }

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    this.sessionCode = code !== null ? code : '';

    this.authService.getConnectedUser().subscribe((user) => {
      if (user) this.myUserId.set(user.uid);
    });

    this.sessionService.getParticipants(this.sessionCode).subscribe((p) => {
      this.participants.set(p as (Participant & { id: string })[]);
    });
  }

  goHome() {
    this.router.navigateByUrl('/quizzes');
  }
}