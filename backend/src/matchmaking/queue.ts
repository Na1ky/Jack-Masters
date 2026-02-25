import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface QueueEntry {
  socketId: string;
  nickname: string;
  token: string;
  enqueuedAt: number;
  timer?: ReturnType<typeof setTimeout>;
}

const MATCHMAKING_TIMEOUT_MS = 15_000;

/** In-memory matchmaking queue */
const queue: QueueEntry[] = [];

export function enqueuePlayer(
  io: Server,
  socket: Socket,
  token: string,
  nickname: string,
  onMatch: (matchId: string, players: Array<{ id: string; nickname: string }>) => void
): void {
  // Prevent duplicate entries
  const existing = queue.findIndex(e => e.token === token);
  if (existing !== -1) {
    clearTimeout(queue[existing].timer);
    queue.splice(existing, 1);
  }

  const entry: QueueEntry = {
    socketId: socket.id,
    nickname,
    token,
    enqueuedAt: Date.now(),
  };

  if (queue.length > 0) {
    // Match with the first waiting player
    const opponent = queue.shift()!;
    clearTimeout(opponent.timer);

    const matchId = uuidv4();
    const players = [
      { id: opponent.socketId, nickname: opponent.nickname },
      { id: socket.id, nickname },
    ];
    onMatch(matchId, players);
  } else {
    // No one waiting — set timeout for bot match
    entry.timer = setTimeout(() => {
      const idx = queue.findIndex(e => e.token === entry.token);
      if (idx !== -1) {
        queue.splice(idx, 1);
        const matchId = uuidv4();
        const players = [
          { id: socket.id, nickname },
          { id: 'bot', nickname: 'Bot' },
        ];
        onMatch(matchId, players);
      }
    }, MATCHMAKING_TIMEOUT_MS);

    queue.push(entry);
    socket.emit('matchmaking:waiting');
  }
}

export function removeFromQueue(token: string): void {
  const idx = queue.findIndex(e => e.token === token);
  if (idx !== -1) {
    clearTimeout(queue[idx].timer);
    queue.splice(idx, 1);
  }
}

export function getQueueLength(): number {
  return queue.length;
}
