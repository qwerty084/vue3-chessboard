import { SQUARES } from 'chess.js';
import type { ChessInstance, Move } from 'chess.js';
import type { Key } from 'chessground/types';
import type { Threat, ThreatCount, SquareKey } from '@/typings/Chessboard';

export function getThreats(game: ChessInstance) {
  const moves = game.moves({ verbose: true });
  const threats: Threat[] = [];
  moves.forEach(function (move) {
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

export function countThreats(
  color: 'white' | 'black',
  fen: string,
  game: ChessInstance
): ThreatCount {
  const threats: ThreatCount = {
    checks_white: 0,
    checks_black: 0,
    fen: '',
    history: [],
    legal_white: 0,
    legal_black: 0,
    threat_white: 0,
    threat_black: 0,
    turn: toColor(game),
  };
  let captures = 0;
  let checks = 0;
  let moves = game.moves({ verbose: true });
  if (color !== toColor(game)) {
    moves = opponentMoves(game);
  }
  if (moves.length === 0) {
    return {
      checks_white: 0,
      checks_black: 0,
      fen: fen || '',
      history: [],
      legal_white: 0,
      legal_black: 0,
      threat_white: 0,
      threat_black: 0,
      turn: toColor(game),
    };
  }
  moves.forEach((move) => {
    if (move.captured) {
      captures++;
    }
    if (move.san.includes('+')) {
      checks++;
    }
  });

  threats[`legal_${color}`] = uniques(moves.map((x) => x.from + x.to)).length;
  threats[`checks_${color}`] = checks;
  threats[`threat_${color}`] = captures;
  threats[`turn`] = color;

  return threats;
}

export function uniques(arr: string[]) {
  const uniqueArray = arr.filter(
    (elem, index, self) => index === self.indexOf(elem)
  );

  return uniqueArray;
}

export function toColor(game: ChessInstance) {
  return game.turn() === 'w' ? 'white' : 'black';
}

export function shortToLongColor(color: 'w' | 'b') {
  return color === 'w' ? 'white' : 'black';
}

export function opponentMoves(game: ChessInstance) {
  const originalPGN = game.pgn();
  const tokens = game.fen().split(' ');
  tokens[1] = tokens[1] === 'w' ? 'b' : 'w';
  const tokenString = tokens.join(' ');
  const valid = game.load(tokenString);
  if (valid) {
    const moves = game.moves({ verbose: true });
    game.load_pgn(originalPGN);
    return moves;
  } else {
    return [];
  }
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

export function calculatePromotions(game: ChessInstance, promotions: Move[]) {
  const moves = game.moves({ verbose: true });
  promotions = [];
  moves.forEach((move) => {
    if (move.promotion) {
      promotions.push(move);
    }
  });

  return promotions;
}
