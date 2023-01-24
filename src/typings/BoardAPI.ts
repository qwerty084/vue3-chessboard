import type { ChessInstance, Move } from 'chess.js';
import type { Api } from 'chessground/api';
import type { Color, Key } from 'chessground/types';
import type { BoardState } from './BoardState';

export interface BoardAPI {
  game: ChessInstance;
  board: Api;
  boardState: BoardState;

  resetBoard: () => void;
  undoLastMove: () => void;
  getMaterialCount: () => {
    materialWhite: number;
    materialBlack: number;
    materialDiff: number;
  };
  toggleOrientation: () => void;
  hideMoves: () => void;
  drawMoves: () => void;
  toggleMoves: () => void;
  getOpeningName: () => Promise<string | null>;
  move: (move: string) => boolean;
  getTurnColor: () => Color;
  getPossibleMoves: () => Map<Key, Key[]> | undefined;
  getCurrentTurnNumber: () => number;
  getLastMove: () => Move | undefined;
  getHistory: () => Move[] | string[];
  getFen: () => string;
}

export interface LichessOpening {
  white: number;
  black: number;
  draws: number;
  moves: [
    {
      uci: string;
      san: string;
      averageRating: number;
      white: number;
      game: null;
      black: number;
      draws: number;
    }
  ];
  opening: {
    eco: string;
    name: string;
  } | null;
  topGames: [
    {
      id: string;
      uci: string;
      month: string;
      year: number;
      winner: 'white' | 'black' | null;
      white: {
        name: string;
        rating: number;
      };
      black: {
        name: string;
        rating: number;
      };
    }
  ];
}

export interface MaterialDifference {
  materialWhite: number;
  materialBlack: number;
  materialDiff: number;
}

export type BrushColor =
  | 'red'
  | 'green'
  | 'blue'
  | 'paleBlue'
  | 'yellow'
  | 'paleGreen'
  | 'paleRed'
  | 'paleGrey';

export interface DrawShape {
  orig: Key;
  dest: Key;
  brush: BrushColor;
}
