import { SQUARES, type Chess, type Move, type Piece } from 'chess.js';
import type { Key } from 'chessground/types';
import type { Threat } from '@/typings/Chessboard';

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

export function roleAbbrToRole(role: string) {
  switch (role) {
    case 'p':
      return 'pawn';
    case 'n':
      return 'knight';
    case 'b':
      return 'bishop';
    case 'r':
      return 'rook';
    case 'q':
      return 'queen';
    case 'k':
      return 'king';
    default:
      return 'pawn';
  }
}

export function possibleMoves(game: Chess) {
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

export function isPromotion(dest: Key, piece: Piece | null) {
  if (piece?.type !== 'p') {
    return false;
  }

  const promotionRow = piece?.color === 'w' ? '8' : '1'; // for white promotion row is 8, for black its 1

  return dest[1] === promotionRow;
}

export function getPossiblePromotions(legalMoves: Move[]): Move[] {
  return legalMoves.filter((move) => move.promotion);
}
