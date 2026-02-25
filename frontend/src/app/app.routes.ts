import { Routes } from '@angular/router';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { MatchmakingComponent } from './pages/matchmaking/matchmaking.component';
import { GameComponent } from './pages/game/game.component';

export const routes: Routes = [
  { path: '',           component: LobbyComponent },
  { path: 'matchmaking', component: MatchmakingComponent },
  { path: 'game',        component: GameComponent },
  { path: '**',          redirectTo: '' },
];

