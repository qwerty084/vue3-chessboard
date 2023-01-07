import { SQUARES, type ChessInstance, type Move } from 'chess.js';
import type { Key } from 'chessground/types';
import type { Threat, SquareKey } from '@/typings/Chessboard';

export function getThreats(moves: Move[]) {
  const threats: Threat[] = [];
  moves.forEach((move) => {
    threats.push({ orig: move.to, brush: 'yellow' });
    if (move['captured']) {
      threats.push({ orig: move.from, dest: move.to, brush: 'red' });
    }
    if (move['san'].includes('+')) {
      threats.push({ orig: move.from, dest: move.to, brush: 'blue' });
    }
  });

  return threats;
}

export function shortToLongColor(color: 'w' | 'b') {
  return color === 'w' ? 'white' : 'black';
}

export function possibleMoves(game: ChessInstance) {
  const dests: Map<Key, Key[]> = new Map();
  SQUARES.forEach((s) => {
    const moves = game.moves({ square: s, verbose: true });

    if (moves.length) {
      dests.set(
        moves[0].from,
        moves.map((m) => m.to)
      );
    }
  });

  return dests;
}

export function isPromotion(
  orig: SquareKey,
  dest: SquareKey,
  promotions: Move[]
): boolean {
  return (
    promotions.filter((move) => move.from === orig && move.to === dest).length >
    0
  );
}

export function getPossiblePromotions(legalMoves: Move[]): Move[] {
  return legalMoves.filter((move) => move.promotion);
}
