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

export function toColor(game: ChessInstance) {
  return game.turn() === 'w' ? 'white' : 'black';
}

export function shortToLongColor(color: 'w' | 'b') {
  return color === 'w' ? 'white' : 'black';
}

export function opponentMoves(game: ChessInstance) {
  let moves: Move[] = [];
  const tokens = game.fen().split(' ');
  tokens[1] = tokens[1] === 'w' ? 'b' : 'w';
  const tokenString = tokens.join(' ');
  const valid = game.load(tokenString);
  if (valid) {
    moves = game.moves({ verbose: true });
    game.load_pgn(game.pgn());
  }

  return moves;
}

export function possibleMoves(game: ChessInstance) {
  const dests: Map<Key, Key[]> = new Map();
  SQUARES.forEach((s) => {
    const ms = game.moves({ square: s, verbose: true });

    if (ms.length) {
      dests.set(
        ms[0].from,
        ms.map((m) => m.to)
      );
    }
  });

  return dests;
}

export function isPromotion(
  orig: SquareKey,
  dest: SquareKey,
  promotions: Move[]
) {
  const filteredPromotions = promotions.filter(
    (move) => move.from === orig && move.to === dest
  );

  return filteredPromotions.length > 0;
}

export function getPossiblePromotions(legalMoves: Move[]) {
  legalMoves = legalMoves.filter((move) => move.promotion);

  return legalMoves;
}
