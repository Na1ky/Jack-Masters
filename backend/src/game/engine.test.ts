import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handTotal, isBust, createDeck, cardValue } from './deck';
import {
  createMatch,
  applyHit,
  applyStand,
  applyBotTurn,
  determineWinner,
  calculatePoints,
  PlayerState,
} from './engine';

test('cardValue: face cards return 10', () => {
  assert.equal(cardValue('J'), 10);
  assert.equal(cardValue('Q'), 10);
  assert.equal(cardValue('K'), 10);
});

test('cardValue: ace returns 11', () => {
  assert.equal(cardValue('A'), 11);
});

test('cardValue: number cards return numeric value', () => {
  assert.equal(cardValue('7'), 7);
  assert.equal(cardValue('10'), 10);
});

test('handTotal: ace adjusts from 11 to 1 to avoid bust', () => {
  const hand = [
    { suit: 'hearts' as const, rank: 'A' as const },
    { suit: 'spades' as const, rank: 'K' as const },
    { suit: 'clubs' as const, rank: '5' as const },
  ];
  // A=1 + K=10 + 5=5 = 16
  assert.equal(handTotal(hand), 16);
});

test('handTotal: natural blackjack = 21', () => {
  const hand = [
    { suit: 'hearts' as const, rank: 'A' as const },
    { suit: 'spades' as const, rank: 'K' as const },
  ];
  assert.equal(handTotal(hand), 21);
});

test('isBust: returns true when total > 21', () => {
  const hand = [
    { suit: 'hearts' as const, rank: 'K' as const },
    { suit: 'spades' as const, rank: 'Q' as const },
    { suit: 'clubs' as const, rank: '5' as const },
  ];
  assert.equal(isBust(hand), true);
});

test('createDeck: returns 52 cards', () => {
  const deck = createDeck();
  assert.equal(deck.length, 52);
});

test('createMatch: deals 2 cards per player', () => {
  const state = createMatch('test-1', [
    { id: 'p1', nickname: 'Alice' },
    { id: 'p2', nickname: 'Bob' },
  ]);
  assert.equal(state.players[0].hand.length, 2);
  assert.equal(state.players[1].hand.length, 2);
  assert.equal(state.deck.length, 48);
});

test('applyHit: player receives a card', () => {
  const state = createMatch('test-2', [
    { id: 'p1', nickname: 'Alice' },
    { id: 'p2', nickname: 'Bob' },
  ]);
  const before = state.players[0].hand.length;
  const updated = applyHit(state, 'p1');
  assert.equal(updated.players[0].hand.length, before + 1);
});

test('applyStand: player stood flag set, turn advances', () => {
  const state = createMatch('test-3', [
    { id: 'p1', nickname: 'Alice' },
    { id: 'p2', nickname: 'Bob' },
  ]);
  const updated = applyStand(state, 'p1');
  const p1 = updated.players.find(p => p.id === 'p1')!;
  assert.equal(p1.stood, true);
  assert.equal(updated.currentTurn, 'p2');
});

test('determineWinner: picks highest non-bust total', () => {
  const players: PlayerState[] = [
    { id: 'p1', nickname: 'Alice', hand: [], total: 19, stood: true, bust: false },
    { id: 'p2', nickname: 'Bob',   hand: [], total: 17, stood: true, bust: false },
  ];
  assert.equal(determineWinner(players), 'p1');
});

test('determineWinner: bust player loses to non-bust', () => {
  const players: PlayerState[] = [
    { id: 'p1', nickname: 'Alice', hand: [], total: 22, stood: false, bust: true },
    { id: 'p2', nickname: 'Bob',   hand: [], total: 15, stood: true,  bust: false },
  ];
  assert.equal(determineWinner(players), 'p2');
});

test('determineWinner: draw on equal totals', () => {
  const players: PlayerState[] = [
    { id: 'p1', nickname: 'Alice', hand: [], total: 18, stood: true, bust: false },
    { id: 'p2', nickname: 'Bob',   hand: [], total: 18, stood: true, bust: false },
  ];
  assert.equal(determineWinner(players), 'draw');
});

test('calculatePoints: winner gets > 0 points', () => {
  const players: PlayerState[] = [
    { id: 'p1', nickname: 'Alice', hand: [], total: 20, stood: true, bust: false },
    { id: 'p2', nickname: 'Bob',   hand: [], total: 17, stood: true, bust: false },
  ];
  const pts = calculatePoints('p1', players);
  assert.ok(pts['p1'] > 0);
  assert.equal(pts['p2'], 0);
});

test('calculatePoints: draw gives both players 5 points', () => {
  const players: PlayerState[] = [
    { id: 'p1', nickname: 'Alice', hand: [], total: 18, stood: true, bust: false },
    { id: 'p2', nickname: 'Bob',   hand: [], total: 18, stood: true, bust: false },
  ];
  const pts = calculatePoints('draw', players);
  assert.equal(pts['p1'], 5);
  assert.equal(pts['p2'], 5);
});

test('applyBotTurn: bot stands at or above 17', () => {
  const state = createMatch('test-bot', [
    { id: 'p1', nickname: 'Alice' },
    { id: 'bot', nickname: 'Bot' },
  ]);
  // Force bot's turn
  const withBotTurn = { ...state, currentTurn: 'bot' };
  const afterBot = applyBotTurn(withBotTurn, 'bot');
  const bot = afterBot.players.find(p => p.id === 'bot')!;
  // Bot should have stood or busted
  assert.ok(bot.stood || bot.bust);
  // If stood, total should be >= 17
  if (bot.stood) {
    assert.ok(bot.total >= 17);
  }
});
