import {
  Chess,
  SQUARES,
  type Move,
  type Piece,
  type PieceSymbol,
  type Square,
} from 'chess.js';
import type { Color, Key } from 'chessground/types';
import type { Threat } from '../typings/Chessboard';

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

/**
 * The legal destinations per square. With rookCastle, castling moves also list the rook's square,
 * because chessground castles when the king is dropped onto its own rook.
 */
export function possibleMoves(
  game: Chess,
  rookCastle = false
): Map<Key, Key[]> {
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

  return rookCastle ? setRookCastleDests(dests, game, true) : dests;
}

/**
 * Adds the rook's square to the king's dests for each castling move the dests allow, or removes it.
 * Keeps all other dests as they are.
 */
export function setRookCastleDests(
  dests: Map<Key, Key[]>,
  game: Chess,
  rookCastle: boolean
): Map<Key, Key[]> {
  const result = new Map(dests);
  for (const m of game.moves({ verbose: true })) {
    if (!m.isKingsideCastle() && !m.isQueensideCastle()) continue;

    const rookSquare = `${m.isKingsideCastle() ? 'h' : 'a'}${m.from[1]}` as Key;
    const kingDests = (result.get(m.from) ?? []).filter(
      (key) => key !== rookSquare
    );
    if (rookCastle && kingDests.includes(m.to)) kingDests.push(rookSquare);
    if (result.has(m.from)) result.set(m.from, kingDests);
  }

  return result;
}

/**
 * The square chess.js expects as the king's destination. When the user castles by dropping the king
 * onto its own rook, chessground reports the rook's square, which chess.js doesn't accept.
 */
export function kingCastlingDest(game: Chess, orig: Key, dest: Key): Key {
  const king = game.get(orig as Square);
  const rook = game.get(dest as Square);
  if (
    king?.type !== 'k' ||
    rook?.type !== 'r' ||
    rook.color !== king.color ||
    orig[1] !== dest[1]
  ) {
    return dest;
  }

  // only castling moves, eg. not a free mode king drop onto its rook from another square
  const kingDest = `${dest[0] > orig[0] ? 'g' : 'c'}${orig[1]}`;
  const isCastling = game
    .moves({ square: orig as Square, verbose: true })
    .some(
      (m) =>
        m.to === kingDest && (m.isKingsideCastle() || m.isQueensideCastle())
    );
  return isCastling ? (kingDest as Key) : dest;
}

export function isPromotion(dest: Key, piece?: Piece | null): boolean {
  if (piece?.type !== 'p') {
    return false;
  }

  const promotionRow = piece?.color === 'w' ? '8' : '1'; // for white promotion row is 8, for black its 1

  return dest[1] === promotionRow;
}

/**
 * Whether the side to move is in check in the given position.
 * Unlike the chess.js constructor this doesn't validate the fen, so it also
 * works for edited positions, eg. without kings.
 */
export function isCheck(fen: string): boolean {
  const [placement, turn] = fen.split(' ');
  const position = new Chess();
  position.clear();
  let kingSquare: Square | undefined;

  placement.split('/').forEach((row, rowIndex) => {
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        file += Number(char);
        continue;
      }
      const square = `${'abcdefgh'[file]}${8 - rowIndex}` as Square;
      const color = char === char.toUpperCase() ? 'w' : 'b';
      const type = char.toLowerCase() as PieceSymbol;
      position.put({ type, color }, square);
      if (type === 'k' && color === turn) {
        kingSquare = square;
      }
      file++;
    }
  });

  return (
    kingSquare !== undefined &&
    position.isAttacked(kingSquare, turn === 'w' ? 'b' : 'w')
  );
}

export function getPossiblePromotions(legalMoves: Move[]): Move[] {
  return legalMoves.filter((move) => move.promotion);
}

/**
 * Whether the value is a plain object, eg. a config section. The config helpers merge plain objects key
 * by key and treat other objects, such as Maps, arrays, functions and DOM elements, as single values.
 */
export function isObject(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isEqualMap(a: unknown, b: unknown): boolean {
  return (
    a instanceof Map &&
    b instanceof Map &&
    a.size === b.size &&
    [...a].every(([key, value]) => b.has(key) && b.get(key) === value)
  );
}

export function deepCopy<T>(value: T): T {
  // copy Maps, eg. movable.dests, so chessground can't modify the caller's or the default Map
  if (value instanceof Map) {
    return new Map(value) as T;
  }

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
    } else if (
      oldConfig?.[key] !== newConfig[key] &&
      // deepCopy copies Maps, so compare their entries instead
      !isEqualMap(oldConfig?.[key], newConfig[key])
    ) {
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
