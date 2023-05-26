import type BoardApi from '@/classes/BoardApi';
import type { Move, Square } from 'chess.js';
import type { Key } from 'chessground/types';
import type { BoardConfig, MoveableColor } from './BoardConfig';

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

export type SquareColor = 'light' | 'dark' | null;

export type Piece = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

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
  (e: 'stalemate'): void;
  (e: 'draw'): void;
  (e: 'check', isInCheck: PieceColor): void;
  (e: 'promotion', promotion: PromotionEvent): void;
  (e: 'move', move: MoveEvent): void;
}

export interface BoardState {
  boardConfig: BoardConfig;
  showThreats: boolean;
  openPromotionDialog: boolean;
  playerColor: MoveableColor;
}

export interface PromotionEvent {
  color: PieceColor;
  sanMove: string;
  promotedTo: 'Q' | 'B' | 'R' | 'N';
}

export type PromotedTo = PromotionEvent['promotedTo'];

export type MoveEvent = Move;
