import { Server, Socket } from 'socket.io';
import { sessions } from '../routes/auth';
import { enqueuePlayer, removeFromQueue } from '../matchmaking/queue';
import {
  createMatch,
  applyHit,
  applyStand,
  applyBotTurn,
  MatchState,
} from '../game/engine';
import { Match } from '../models/match';

/** Active matches keyed by matchId */
const activeMatches = new Map<string, MatchState>();
/** Map socket id -> matchId */
const socketToMatch = new Map<string, string>();
/** Map socket id -> token */
const socketToToken = new Map<string, string>();

let mongoAvailable = false;
export function setMongoAvailable(available: boolean): void {
  mongoAvailable = available;
}

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    /**
     * identify: { token }
     * Client must identify themselves after connection.
     */
    socket.on('identify', (data: { token?: string }) => {
      const token = data?.token;
      if (typeof token !== 'string' || !sessions.has(token)) {
        socket.emit('error', { message: 'Invalid token' });
        return;
      }
      socketToToken.set(socket.id, token);
      socket.emit('identified', { nickname: sessions.get(token) });
    });

    /**
     * matchmaking:enqueue
     * Puts the player into the matchmaking queue.
     */
    socket.on('matchmaking:enqueue', () => {
      const token = socketToToken.get(socket.id);
      if (!token) {
        socket.emit('error', { message: 'Not identified' });
        return;
      }
      const nickname = sessions.get(token) ?? 'Unknown';

      enqueuePlayer(io, socket, token, nickname, (matchId, players) => {
        startMatch(io, matchId, players);
      });
    });

    /**
     * player:action { action: 'hit' | 'stand' }
     */
    socket.on('player:action', (data: { action?: string }) => {
      const matchId = socketToMatch.get(socket.id);
      if (!matchId) return;

      const state = activeMatches.get(matchId);
      if (!state || state.status === 'finished') return;
      if (state.currentTurn !== socket.id) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      let updated: MatchState;
      if (data?.action === 'hit') {
        updated = applyHit(state, socket.id);
      } else if (data?.action === 'stand') {
        updated = applyStand(state, socket.id);
      } else {
        socket.emit('error', { message: 'Invalid action' });
        return;
      }

      activeMatches.set(matchId, updated);
      broadcastState(io, matchId, updated);

      // If it's now the bot's turn, run bot logic
      if (updated.status === 'active' && updated.currentTurn === 'bot') {
        const afterBot = applyBotTurn(updated, 'bot');
        activeMatches.set(matchId, afterBot);
        broadcastState(io, matchId, afterBot);
        if (afterBot.status === 'finished') {
          finalizeMatch(matchId, afterBot);
        }
      } else if (updated.status === 'finished') {
        finalizeMatch(matchId, updated);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      const token = socketToToken.get(socket.id);
      if (token) {
        removeFromQueue(token);
        socketToToken.delete(socket.id);
      }
      socketToMatch.delete(socket.id);
    });
  });
}

function startMatch(
  io: Server,
  matchId: string,
  players: Array<{ id: string; nickname: string }>
): void {
  const state = createMatch(matchId, players);
  activeMatches.set(matchId, state);

  for (const player of players) {
    if (player.id !== 'bot') {
      const sock = io.sockets.sockets.get(player.id);
      if (sock) {
        sock.join(matchId);
        socketToMatch.set(player.id, matchId);
      }
    }
  }

  io.to(matchId).emit('match:found', {
    matchId,
    players: players.map(p => ({ id: p.id, nickname: p.nickname })),
  });

  broadcastState(io, matchId, state);

  // If first player is bot (shouldn't happen normally), handle it
  if (state.currentTurn === 'bot') {
    const afterBot = applyBotTurn(state, 'bot');
    activeMatches.set(matchId, afterBot);
    broadcastState(io, matchId, afterBot);
    if (afterBot.status === 'finished') {
      finalizeMatch(matchId, afterBot);
    }
  }
}

function broadcastState(io: Server, matchId: string, state: MatchState): void {
  // Send sanitized state (no deck details)
  const safeState = {
    matchId: state.matchId,
    status: state.status,
    currentTurn: state.currentTurn,
    winner: state.winner,
    points: state.points,
    players: state.players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      hand: p.hand,
      total: p.total,
      stood: p.stood,
      bust: p.bust,
    })),
  };
  io.to(matchId).emit('match:state', safeState);
}

async function finalizeMatch(matchId: string, state: MatchState): Promise<void> {
  if (!mongoAvailable) return;
  try {
    await Match.create({
      matchId,
      players: state.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        total: p.total,
      })),
      winner: state.winner ?? 'unknown',
      points: state.points ?? {},
    });
  } catch (err) {
    console.warn('[mongo] failed to persist match:', err);
  }
}
