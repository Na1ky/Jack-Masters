import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="lobby-container">
      <h1>🃏 Jack Masters</h1>
      <p class="subtitle">MEAN Multiplayer Edition</p>
      <div class="card">
        <label for="nickname">Nickname</label>
        <input
          id="nickname"
          type="text"
          [(ngModel)]="nickname"
          placeholder="Enter your nickname"
          maxlength="32"
          (keydown.enter)="play()"
        />
        <button class="btn-play" [disabled]="loading" (click)="play()">
          {{ loading ? 'Connecting…' : 'Play' }}
        </button>
        <p *ngIf="error" class="error">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .lobby-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #fff; font-family: sans-serif;
    }
    h1 { font-size: 3rem; margin: 0; }
    .subtitle { color: #a0aec0; margin-top: .5rem; }
    .card {
      background: rgba(255,255,255,0.08); border-radius: 12px;
      padding: 2rem; display: flex; flex-direction: column; gap: 1rem;
      min-width: 320px; margin-top: 2rem;
    }
    label { font-size: .875rem; color: #a0aec0; }
    input {
      padding: .75rem; border-radius: 8px; border: 1px solid #4a5568;
      background: rgba(255,255,255,0.05); color: #fff; font-size: 1rem;
    }
    .btn-play {
      padding: .85rem; background: #e53e3e; color: #fff; border: none;
      border-radius: 8px; font-size: 1.1rem; cursor: pointer; font-weight: 700;
    }
    .btn-play:hover:not(:disabled) { background: #c53030; }
    .btn-play:disabled { opacity: .6; cursor: not-allowed; }
    .error { color: #fc8181; font-size: .875rem; }
  `],
})
export class LobbyComponent {
  nickname = '';
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private socket: SocketService,
    private router: Router,
  ) {}

  play(): void {
    const nick = this.nickname.trim();
    if (!nick) { this.error = 'Please enter a nickname.'; return; }
    this.loading = true;
    this.error = '';

    this.api.createGuest(nick).subscribe({
      next: ({ token, nickname }) => {
        sessionStorage.setItem('jm_token', token);
        sessionStorage.setItem('jm_nickname', nickname);

        this.socket.connect();
        this.socket.identify(token);

        this.socket.onIdentified().subscribe(() => {
          this.loading = false;
          this.router.navigate(['/matchmaking']);
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not connect to server. Is the backend running?';
      },
    });
  }
}
