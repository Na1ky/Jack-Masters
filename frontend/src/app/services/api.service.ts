import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GuestResponse {
  token: string;
  nickname: string;
}

export interface EnqueueResponse {
  queued: boolean;
  position: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.backendUrl;

  constructor(private http: HttpClient) {}

  createGuest(nickname: string): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(`${this.base}/api/auth/guest`, { nickname });
  }

  enqueue(token: string): Observable<EnqueueResponse> {
    return this.http.post<EnqueueResponse>(`${this.base}/api/matchmaking/enqueue`, { token });
  }

  health(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(`${this.base}/api/health`);
  }
}
