import { read } from 'chessground/fen';
import { getThreats } from '@/helper/Board';
import { possibleMoves, shortToLongColor } from '@/helper/Board';
import type { ChessInstance } from 'chess.js';
import type { Api } from 'chessground/api';
import type { BoardState } from '@/typings/BoardStore';

/**
 * class for modifying and reading data from the board, \
 * extends the lichess chessground api & chess.js api \
 * lichess documentation: https://github.com/lichess-org/chessground/blob/master/src/api.ts \
 * chess.js documentation: https://github.com/jhlywa/chess.js/blob/master/README.md
 */
export class BoardApi {
  constructor(
    public game: ChessInstance,
    public board: Api,
    public state: BoardState
  ) {
    this.board.set(this.state.boardConfig);
  }

  /**
   * Reset the board to the initial starting position.
   */
  resetBoard() {
    this.game.reset();
    this.board.set(this.state.boardConfig);
    this.board.state.check = undefined;
    this.board.selectSquare(null);
    if (this.state.showThreats) {
      this.board.setShapes(getThreats(this.game));
    }
  }

  /**
   * undo last Move, if possible
   */
  undoLastMove() {
    const lastMove = this.game.undo();
    if (lastMove == null) return;
    this.board.state.pieces = read(this.game.fen());

    this.board.state.turnColor = shortToLongColor(lastMove.color);
    if (history.length === 1) {
      this.board.state.lastMove = undefined;
    } else {
      this.board.state.lastMove = [lastMove?.from, lastMove?.to];
    }

    this.board.state.movable.color = this.board.state.turnColor;
    this.board.state.movable.dests = possibleMoves(this.game);
    this.board.redrawAll();

    if (this.state.showThreats) {
      // redraw threats in new position if enabled
      this.board.setShapes(getThreats(this.game));
    }
  }

  /**
   * returns the current material count for white, black and the diff.
   * If diff > 0 white is leading, else black.
   */
  getMaterialCount() {
    const pieces = this.board.state.pieces;
    const pieceToNum = new Map([
      ['pawn', 1],
      ['knight', 3],
      ['bishop', 3],
      ['rook', 5],
      ['queen', 9],
      ['king', 0],
    ]);

    const materialCount = {
      materialWhite: 0,
      materialBlack: 0,
      materialDiff: 0,
    };

    pieces.forEach((piece) => {
      if (piece.color === 'white') {
        materialCount.materialWhite += pieceToNum.get(piece.role) || 0;
      } else {
        materialCount.materialBlack += pieceToNum.get(piece.role) || 0;
      }
    });
    materialCount.materialDiff =
      materialCount.materialWhite - materialCount.materialBlack;

    return materialCount;
  }

  /**
   * enable drawing of threats/possible moves on the board
   */
  showThreats() {
    this.state.showThreats = true;
    this.board.setShapes(getThreats(this.game));
  }

  /**
   * disable drawing of threats/possible moves on the board
   */
  hideThreats() {
    this.state.showThreats = false;
    this.board.setShapes([]);
  }

  /**
   * toggle drawing of threats/possible moves on the board
   */
  toggleThreats() {
    this.state.showThreats = !this.state.showThreats;
    if (this.state.showThreats) {
      this.board.setShapes(getThreats(this.game));
    } else {
      this.board.setShapes([]);
    }
  }
}

export default BoardApi;
