import type BoardApi from '@/classes/BoardApi';
import type { Square } from 'chess.js';
import type { Key } from 'chessground/types';

export interface possibleMoves {
  [key: string]: {
    value: string[];
  };
}

export interface Threat {
  orig: Square;
  dest?: Square;
  brush: string;
}

export type Promotion = 'q' | 'n' | 'b' | 'r' | undefined;

export interface ThreatCount {
  checks_white: number;
  checks_black: number;
  fen: string;
  history: string[];
  legal_white: number;
  legal_black: number;
  threat_white: number;
  threat_black: number;
  turn: 'white' | 'black';
}

export type SquareKey = Square & Key;

export type PieceColor = 'white' | 'black';

export interface Emit {
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'checkmate', isMated: PieceColor): void;
  (e: 'stalemate', isStalemate: boolean): void;
  (e: 'draw', isDraw: boolean): void;
  (e: 'check', isInCheck: PieceColor): void;
}
