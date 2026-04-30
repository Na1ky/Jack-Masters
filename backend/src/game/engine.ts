import { Card, createDeck, handTotal, isBust } from './deck';

export type PlayerRole = 'player1' | 'player2' | 'bot';

export interface PlayerState {
  id: string;           // socket id or 'bot'
  nickname: string;
  hand: Card[];
  total: number;
  stood: boolean;
  bust: boolean;
}

export interface MatchState {
  matchId: string;
  status: 'active' | 'finished';
  players: PlayerState[];
  currentTurn: string;  // player id whose turn it is
  winner?: string;      // player id or 'draw'
  points?: Record<string, number>;
  deck: Card[];
}

/**
 * Award points based on closeness to 21.
 * Winner gets 10 + (21 - distance_from_21).
 * Loser gets 0. Draw: both get 5.
 */
export function calculatePoints(
  winnerId: string,
  players: PlayerState[]
): Record<string, number> {
  const points: Record<string, number> = {};
  for (const p of players) {
    points[p.id] = 0;
  }

  if (winnerId === 'draw') {
    for (const p of players) {
      points[p.id] = 5;
    }
    return points;
  }

  const winner = players.find(p => p.id === winnerId);
  if (winner) {
    const bestTotal = winner.total <= 21 ? winner.total : 0;
    points[winnerId] = 10 + (21 - (21 - bestTotal));  // = 10 + bestTotal - 0 simplified to bestTotal
    // Minimum 10, max 21 (when total=21)
    points[winnerId] = Math.max(10, Math.min(21, 10 + (bestTotal - 10)));
  }
  return points;
}

/** Determine winner after all players stood or busted */
export function determineWinner(players: PlayerState[]): string {
  const alive = players.filter(p => !p.bust);
  if (alive.length === 0) {
    // all bust — player closest to 21 wins (lowest bust total)
    const sorted = [...players].sort((a, b) => a.total - b.total);
    return sorted[0].id;
  }
  if (alive.length === 1) return alive[0].id;

  // highest total wins
  const best = Math.max(...alive.map(p => p.total));
  const winners = alive.filter(p => p.total === best);
  if (winners.length > 1) return 'draw';
  return winners[0].id;
}

/** Create initial match state */
export function createMatch(
  matchId: string,
  playerIds: Array<{ id: string; nickname: string }>
): MatchState {
  const deck = createDeck();
  const players: PlayerState[] = playerIds.map(p => ({
    id: p.id,
    nickname: p.nickname,
    hand: [],
    total: 0,
    stood: false,
    bust: false,
  }));

  // Deal 2 cards to each player
  for (let i = 0; i < 2; i++) {
    for (const player of players) {
      const card = deck.pop()!;
      player.hand.push(card);
    }
  }

  for (const player of players) {
    player.total = handTotal(player.hand);
  }

  return {
    matchId,
    status: 'active',
    players,
    currentTurn: players[0].id,
    deck,
  };
}

/** Apply a 'hit' action for a player */
export function applyHit(state: MatchState, playerId: string): MatchState {
  const s = deepClone(state);
  const player = s.players.find(p => p.id === playerId);
  if (!player || player.stood || player.bust) return s;

  const card = s.deck.pop()!;
  player.hand.push(card);
  player.total = handTotal(player.hand);
  player.bust = isBust(player.hand);

  if (player.bust) {
    advanceTurn(s, playerId);
    checkFinished(s);
  }
  return s;
}

/** Apply a 'stand' action for a player */
export function applyStand(state: MatchState, playerId: string): MatchState {
  const s = deepClone(state);
  const player = s.players.find(p => p.id === playerId);
  if (!player || player.stood || player.bust) return s;

  player.stood = true;
  advanceTurn(s, playerId);
  checkFinished(s);
  return s;
}

function advanceTurn(s: MatchState, currentPlayerId: string): void {
  const idx = s.players.findIndex(p => p.id === currentPlayerId);
  let next = (idx + 1) % s.players.length;
  // skip players who are done
  let tries = 0;
  while ((s.players[next].stood || s.players[next].bust) && tries < s.players.length) {
    next = (next + 1) % s.players.length;
    tries++;
  }
  s.currentTurn = s.players[next].id;
}

function checkFinished(s: MatchState): void {
  const allDone = s.players.every(p => p.stood || p.bust);
  if (allDone) {
    s.status = 'finished';
    s.winner = determineWinner(s.players);
    s.points = calculatePoints(s.winner, s.players);
  }
}

/** Bot strategy: hit until total >= 17, then stand */
export function applyBotTurn(state: MatchState, botId: string): MatchState {
  let s = deepClone(state);
  const bot = s.players.find(p => p.id === botId);
  if (!bot || bot.stood || bot.bust) return s;

  while (bot.total < 17 && !bot.bust) {
    s = applyHit(s, botId);
    const updatedBot = s.players.find(p => p.id === botId)!;
    if (updatedBot.bust) return s;
  }
  if (!bot.bust) {
    s = applyStand(s, botId);
  }
  return s;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
