import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf, JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService, MatchStatePayload, PlayerData } from '../../services/socket.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="game-container" *ngIf="state; else loading">
      <h2 class="match-title">Match: {{ state.matchId.slice(0,8) }}…</h2>

      <div class="players">
        <div class="player-card" *ngFor="let p of state.players"
             [class.active]="state.currentTurn === p.id"
             [class.you]="p.id === myId">
          <div class="player-name">
            {{ p.nickname }} <span *ngIf="p.id === myId" class="you-badge">YOU</span>
            <span *ngIf="p.id === 'bot'" class="bot-badge">BOT</span>
          </div>
          <div class="cards">
            <span class="card" *ngFor="let c of p.hand">{{ cardEmoji(c.rank, c.suit) }}</span>
          </div>
          <div class="total" [class.bust]="p.bust">
            Total: {{ p.total }}<span *ngIf="p.bust"> 💥 BUST</span><span *ngIf="p.stood"> ✋ STOOD</span>
          </div>
          <div *ngIf="state.points && state.points[p.id] !== undefined" class="points">
            Points earned: {{ state.points[p.id] }}
          </div>
        </div>
      </div>

      <div class="actions" *ngIf="state.status === 'active' && state.currentTurn === myId">
        <button class="btn-action btn-hit"   (click)="hit()">🃏 Hit</button>
        <button class="btn-action btn-stand" (click)="stand()">✋ Stand</button>
      </div>

      <div class="waiting" *ngIf="state.status === 'active' && state.currentTurn !== myId">
        Waiting for {{ opponentName }}…
      </div>

      <div class="result" *ngIf="state.status === 'finished'">
        <ng-container *ngIf="state.winner === myId">🏆 You won!</ng-container>
        <ng-container *ngIf="state.winner === 'draw'">🤝 Draw!</ng-container>
        <ng-container *ngIf="state.winner && state.winner !== myId && state.winner !== 'draw'">
          😞 You lost. {{ opponentName }} wins.
        </ng-container>
        <button class="btn-play-again" (click)="playAgain()">Play Again</button>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading">Loading match…</div>
    </ng-template>
  `,
  styles: [`
    .game-container {
      display: flex; flex-direction: column; align-items: center;
      min-height: 100vh; padding: 2rem;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #fff; font-family: sans-serif; gap: 1.5rem;
    }
    .match-title { color: #a0aec0; font-size: 1rem; }
    .players { display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center; }
    .player-card {
      background: rgba(255,255,255,.07); border-radius: 12px; padding: 1.5rem;
      min-width: 220px; display: flex; flex-direction: column; gap: .75rem;
      border: 2px solid transparent; transition: border-color .3s;
    }
    .player-card.active { border-color: #e53e3e; }
    .player-card.you    { border-color: #38a169; }
    .player-card.active.you { border-color: #d69e2e; }
    .player-name { font-weight: 700; font-size: 1.1rem; display: flex; gap: .5rem; align-items: center; }
    .you-badge  { font-size: .7rem; background: #38a169; padding: 2px 6px; border-radius: 4px; }
    .bot-badge  { font-size: .7rem; background: #805ad5; padding: 2px 6px; border-radius: 4px; }
    .cards { display: flex; flex-wrap: wrap; gap: .4rem; font-size: 2rem; }
    .card { user-select: none; }
    .total { font-size: 1.2rem; }
    .total.bust { color: #fc8181; }
    .points { color: #68d391; font-size: .9rem; }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-action {
      padding: .85rem 2rem; border: none; border-radius: 8px;
      font-size: 1.1rem; font-weight: 700; cursor: pointer;
    }
    .btn-hit   { background: #e53e3e; color: #fff; }
    .btn-hit:hover   { background: #c53030; }
    .btn-stand { background: #2d3748; color: #fff; border: 2px solid #4a5568; }
    .btn-stand:hover { background: #4a5568; }
    .waiting { color: #a0aec0; font-size: 1rem; margin-top: 1rem; }
    .result {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      font-size: 1.75rem; font-weight: 700; margin-top: 1rem;
    }
    .btn-play-again {
      padding: .7rem 2rem; background: #e53e3e; color: #fff; border: none;
      border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 700;
    }
    .loading {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; color: #fff; font-size: 1.5rem;
      background: #1a1a2e;
    }
  `],
})
export class GameComponent implements OnInit, OnDestroy {
  state: MatchStatePayload | null = null;
  myId = '';
  private subs = new Subscription();

  constructor(private socket: SocketService, private router: Router) {}

  ngOnInit(): void {
    this.myId = this.socket.socketId ?? sessionStorage.getItem('jm_socket') ?? '';

    this.subs.add(
      this.socket.onMatchState().subscribe(s => {
        this.state = s;
        // Capture our socket id once the match starts
        if (!this.myId) this.myId = this.socket.socketId ?? '';
      })
    );

    this.subs.add(
      this.socket.onMatchFound().subscribe(payload => {
        // Identify our own player in the match
        const mySocketId = this.socket.socketId ?? '';
        const me = payload.players.find(p => p.id === mySocketId);
        if (me) this.myId = me.id;
      })
    );
  }

  get opponentName(): string {
    return this.state?.players.find(p => p.id !== this.myId)?.nickname ?? 'Opponent';
  }

  hit(): void   { this.socket.sendAction('hit'); }
  stand(): void { this.socket.sendAction('stand'); }

  playAgain(): void {
    this.router.navigate(['/matchmaking']);
  }

  cardEmoji(rank: string, suit: string): string {
    const suitMap: Record<string, string> = {
      hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
    };
    return `${rank}${suitMap[suit] ?? suit}`;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
