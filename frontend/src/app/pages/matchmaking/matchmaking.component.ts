import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-matchmaking',
  standalone: true,
  imports: [],
  template: `
    <div class="mm-container">
      <h2>⏳ Searching for opponent…</h2>
      <div class="spinner"></div>
      <p class="hint">A bot will be assigned if no opponent is found within 15 seconds.</p>
      <button class="btn-cancel" (click)="cancel()">Cancel</button>
    </div>
  `,
  styles: [`
    .mm-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #fff; font-family: sans-serif; gap: 1.5rem;
    }
    h2 { font-size: 1.75rem; margin: 0; }
    .spinner {
      width: 56px; height: 56px; border: 6px solid rgba(255,255,255,.2);
      border-top-color: #e53e3e; border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hint { color: #a0aec0; font-size: .875rem; }
    .btn-cancel {
      padding: .6rem 1.6rem; background: transparent; color: #a0aec0;
      border: 1px solid #4a5568; border-radius: 8px; cursor: pointer; font-size: 1rem;
    }
    .btn-cancel:hover { color: #fff; border-color: #a0aec0; }
  `],
})
export class MatchmakingComponent implements OnInit, OnDestroy {
  private subs = new Subscription();

  constructor(private socket: SocketService, private router: Router) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('jm_token');
    if (!token) { this.router.navigate(['/']); return; }

    this.socket.enqueue();

    this.subs.add(
      this.socket.onMatchFound().subscribe(payload => {
        sessionStorage.setItem('jm_match', JSON.stringify(payload));
        this.router.navigate(['/game']);
      })
    );
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
