import { SQUARES, type Chess, type Move, type Piece } from 'chess.js';
import type { Color, Key } from 'chessground/types';
import type { Threat } from '@/typings/Chessboard';

export function getThreats(moves: Move[]): Threat[] {
  const threats: Threat[] = [];

  for (const move of moves) {
    threats.push({ orig: move.to, brush: 'yellow' });
    if (move['captured']) {
      threats.push({ orig: move.from, dest: move.to, brush: 'red' });
    }
    if (move['san'].includes('+')) {
      threats.push({ orig: move.from, dest: move.to, brush: 'blue' });
    }
  }

  return threats;
}

export function shortToLongColor(color: 'w' | 'b'): Color {
  return color === 'w' ? 'white' : 'black';
}

export function possibleMoves(game: Chess): Map<Key, Key[]> {
  const dests: Map<Key, Key[]> = new Map();

  for (const square of SQUARES) {
    const moves = game.moves({ square, verbose: true });

    if (moves.length) {
      dests.set(
        moves[0].from,
        moves.map((m) => m.to)
      );
    }
  }

  return dests;
}

export function isPromotion(dest: Key, piece: Piece | null): boolean {
  if (piece?.type !== 'p') {
    return false;
  }

  const promotionRow = piece?.color === 'w' ? '8' : '1'; // for white promotion row is 8, for black its 1

  return dest[1] === promotionRow;
}

export function getPossiblePromotions(legalMoves: Move[]): Move[] {
  return legalMoves.filter((move) => move.promotion);
}

export function isObject(value: unknown): boolean {
  return (
    Boolean(value) &&
    value instanceof Object &&
    !(value instanceof Array) &&
    !(value instanceof Function)
  );
}

export function deepCopy<T>(value: T): T {
  return isObject(value)
    ? (Object.fromEntries(
        Object.entries(value as object).map(([key, val]) => [
          key,
          deepCopy(val),
        ])
      ) as T)
    : value;
}

export function deepMergeConfig<T>(target: T, source: T): T {
  const result = { ...target, ...source };
  for (const key in result) {
    result[key] =
      isObject(target?.[key]) && isObject(source?.[key])
        ? deepMergeConfig(target[key], source[key])
        : deepCopy(result[key]);
  }
  return result;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function deepDiffConfig<T>(oldConfig: T, newConfig: T): DeepPartial<T> {
  const diff = {} as DeepPartial<T>;
  for (const key in newConfig) {
    if (isObject(oldConfig?.[key]) && isObject(newConfig?.[key])) {
      const subDiff = deepDiffConfig(
        oldConfig[key],
        newConfig[key]
      ) as T[keyof T] extends object ? DeepPartial<T[keyof T]> : never; // sometimes I like typescript, others I dont...
      if (Object.keys(subDiff).length > 0) diff[key as keyof T] = subDiff;
    } else if (oldConfig?.[key] !== newConfig[key]) {
      diff[key] = newConfig[key];
    }
  }
  return diff;
}

export const chessJSPieceToLichessPiece = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};
