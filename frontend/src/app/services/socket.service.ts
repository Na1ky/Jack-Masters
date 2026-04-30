import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MatchFoundPayload {
  matchId: string;
  players: Array<{ id: string; nickname: string }>;
}

export interface PlayerData {
  id: string;
  nickname: string;
  hand: Array<{ suit: string; rank: string }>;
  total: number;
  stood: boolean;
  bust: boolean;
}

export interface MatchStatePayload {
  matchId: string;
  status: 'active' | 'finished';
  currentTurn: string;
  winner?: string;
  points?: Record<string, number>;
  players: PlayerData[];
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;

  private matchFound$ = new Subject<MatchFoundPayload>();
  private matchState$ = new Subject<MatchStatePayload>();
  private waiting$ = new Subject<void>();
  private identified$ = new Subject<{ nickname: string }>();
  private error$ = new Subject<{ message: string }>();

  connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(environment.backendUrl, { transports: ['websocket'] });

    this.socket.on('match:found',    (data: MatchFoundPayload) => this.matchFound$.next(data));
    this.socket.on('match:state',    (data: MatchStatePayload) => this.matchState$.next(data));
    this.socket.on('matchmaking:waiting', () => this.waiting$.next());
    this.socket.on('identified',     (data: { nickname: string }) => this.identified$.next(data));
    this.socket.on('error',          (data: { message: string }) => this.error$.next(data));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  identify(token: string): void {
    this.socket?.emit('identify', { token });
  }

  enqueue(): void {
    this.socket?.emit('matchmaking:enqueue');
  }

  sendAction(action: 'hit' | 'stand'): void {
    this.socket?.emit('player:action', { action });
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  onMatchFound(): Observable<MatchFoundPayload> { return this.matchFound$.asObservable(); }
  onMatchState(): Observable<MatchStatePayload> { return this.matchState$.asObservable(); }
  onWaiting(): Observable<void>                 { return this.waiting$.asObservable(); }
  onIdentified(): Observable<{ nickname: string }> { return this.identified$.asObservable(); }
  onError(): Observable<{ message: string }>    { return this.error$.asObservable(); }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
