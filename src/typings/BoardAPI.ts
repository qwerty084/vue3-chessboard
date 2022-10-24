import type { ChessInstance, Square } from 'chess.js';
import type { Api } from 'chessground/api';
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
  showThreats: () => void;
  toggleThreats: () => void;
  getOpeningName: () => Promise<string | null>;
  getOpeningDescription: (
    maxDescriptionLength: number
  ) => Promise<string | null>;
  makeMove: (from: Square, to: Square) => void;
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
