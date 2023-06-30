import type BoardApi from '@/classes/BoardApi';
import type { Move as FullMove, Square } from 'chess.js';
import type { Key } from 'chessground/types';
import type { BoardConfig, MoveableColor } from './BoardConfig';

export type Move =
  | string
  | {
      from: Key;
      to: Key;
      promotion?: Promotion;
    };

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

export type Promotion = 'q' | 'n' | 'b' | 'r';

export type PromotionPiece = {
  name: 'Queen' | 'Rook' | 'Knight' | 'Bishop';
  data: Promotion;
};

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

export interface Emits {
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'check' | 'checkmate', color: PieceColor): void;
  (e: 'stalemate'): void;
  (e: 'draw'): void;
  (e: 'promotion', promotion: PromotionEvent): void;
  (e: 'move', move: MoveEvent): void;
}

export interface Props {
  boardConfig?: BoardConfig;
  playerColor?: MoveableColor;
  reactiveConfig?: boolean;
}

export interface BoardState {
  showThreats: boolean;
  promotionDialogState: PromotionDialogState;
  historyViewerState: HistoryViewerState;
}

export interface PromotionDialogState {
  isEnabled: boolean;
  color?: PieceColor;
  callback?: (promotionValue: Promotion) => void;
}

export interface PromotionEvent {
  color: PieceColor;
  sanMove: string;
  promotedTo: 'Q' | 'B' | 'R' | 'N';
}

export type PromotedTo = PromotionEvent['promotedTo'];

export type MoveEvent = FullMove;

export type HistoryViewerState =
  | {
      isEnabled: false;
    }
  | {
      isEnabled: true;
      plyViewing: number;
      viewOnly: boolean;
    };
