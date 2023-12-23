import type { PieceSymbol } from 'chess.js';
import type { Key } from 'chessground/types';

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

export interface CapturedPieces {
  white: PieceSymbol[];
  black: PieceSymbol[];
}
