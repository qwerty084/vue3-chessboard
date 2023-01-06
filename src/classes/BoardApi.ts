import { toRaw } from 'vue';
import { possibleMoves, shortToLongColor, getThreats } from '@/helper/Board';
import type { ChessInstance, Square } from 'chess.js';
import type { Api } from 'chessground/api';
import type { BoardState } from '@/typings/BoardState';
import type { LichessOpening, BoardAPI } from '@/typings/BoardAPI';

/**
 * class for modifying and reading data from the board, \
 * extends the lichess chessground api & chess.js api \
 * lichess documentation: https://github.com/lichess-org/chessground/blob/master/src/api.ts \
 * chess.js documentation: https://github.com/jhlywa/chess.js/blob/master/README.md
 */
export class BoardApi implements BoardAPI {
  constructor(
    public game: ChessInstance,
    public board: Api,
    public boardState: BoardState
  ) {}

  /**
   * Reset the board to the initial starting position.
   */
  resetBoard() {
    console.log(this.game.fen());
    console.log(this.board.getFen());
    this.game.reset();
    this.board.set(this.boardState.boardConfig);
    this.board.state.check = undefined;
    this.board.selectSquare(null);
    if (this.boardState.showThreats) {
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    }
    console.log(this.game.fen());
    console.log(this.board.getFen());
  }

  /**
   * undo last Move, if possible
   */
  undoLastMove() {
    const undoMove = this.game.undo();
    if (undoMove == null) return;
    const lastMove = this.game.history({ verbose: true }).at(-1);

    this.board.set({ fen: this.game.fen() });
    this.board.state.turnColor = shortToLongColor(this.game.turn());

    this.board.state.movable.color = this.board.state.turnColor;
    this.board.state.movable.dests = possibleMoves(this.game);

    if (this.game.history().length === 0 || typeof lastMove === 'undefined') {
      this.board.state.lastMove = undefined;
    } else {
      this.board.state.lastMove = [lastMove?.from, lastMove?.to];
    }

    if (this.boardState.showThreats) {
      // redraw threats in new position if enabled
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
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
    this.boardState.showThreats = true;
    this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
  }

  /**
   * disable drawing of threats/possible moves on the board
   */
  hideThreats() {
    this.boardState.showThreats = false;
    this.board.setShapes([]);
  }

  /**
   * toggle drawing of threats/possible moves on the board
   */
  toggleThreats() {
    this.boardState.showThreats = !this.boardState.showThreats;
    if (this.boardState.showThreats) {
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    } else {
      this.board.setShapes([]);
    }
  }

  /**
   * returns the opening name for the current position
   */
  async getOpeningName() {
    try {
      const movesArr: string[] = [];
      const history = this.game.history({ verbose: true });
      history.forEach((move) => {
        movesArr.push(move.from + move.to);
      });
      const moves = movesArr.join(',');

      const res = await fetch(
        `https://explorer.lichess.ovh/masters?play=${moves}`
      );
      const data: LichessOpening = await res.json();

      return data.opening?.name ?? null;
    } catch {
      return null;
    }
  }

  async getOpeningDescription(maxDescriptionLength: number) {
    const gameHistory = this.game.history({ verbose: true });
    let moves = '';
    let counter = 0;
    gameHistory.forEach((move, i) => {
      if (i % 2 === 0 || i === 0) counter++;
      const sign = i % 2 === 0 ? '_' : '..';
      const moveTo = `${counter}.${sign}${
        move.san.includes('x') ? move.san : move.to
      }/`;
      moves += moveTo;
    });
    moves = moves.slice(0, -1);

    try {
      const res = await fetch(
        `https://en.wikibooks.org/w/api.php?titles=Chess_Opening_Theory/${moves}&redirects&origin=*&action=query&prop=extracts&formatversion=2&format=json&explaintext&exchars=${maxDescriptionLength}`
      );
      const data = await res.json();
      if (data.query?.pages[0]?.extract) {
        return data.query.pages[0].extract;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * make a move programmatically on the board
   *
   * @deprecated
   * Will be deleted in the future
   * Please use the new move method
   *
   */
  makeMove(from: Square, to: Square) {
    const move = this.game.move({ from, to });
    if (move == null) return;
    this.board.move(from, to);
    this.board.state.movable.dests = possibleMoves(this.game);
    this.board.state.turnColor = shortToLongColor(this.game.turn());
    this.board.state.movable.color = this.board.state.turnColor;
    this.board.state.lastMove = [from, to];

    if (this.boardState.showThreats) {
      // redraw threats in new position if enabled
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    }
  }

  /**
   * make a move programmatically on the board
   */
  move(from: Square, to: Square) {
    const move = this.game.move({ from, to });
    if (move == null) return;

    this.board.move(from, to);
    this.board.state.movable.dests = possibleMoves(this.game);
    this.board.state.turnColor = shortToLongColor(this.game.turn());
    this.board.state.movable.color = this.board.state.turnColor;
    this.board.state.lastMove = [from, to];

    if (this.boardState.showThreats) {
      // redraw threats in new position if enabled
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    }
  }

  /**
   * Returns the last move on the board as an array: [from, to] or undefined
   */
  getLastMove() {
    return toRaw(this.board.state.lastMove);
  }

  /**
   * Retrieves the move history.
   *
   * @param verbose - passing true will add more info
   * @returns Verbose: [{"color": "w", "from": "e2", "to": "e4", "flags": "b", "piece": "p", "san": "e4"}],  without verbose flag: [ "e7", "e5" ]
   */
  getHistory(verbose = false) {
    return this.game.history({ verbose: verbose });
  }

  /**
   * Returns the current turn color, "white" or "black"
   */
  getTurn() {
    return this.board.state.turnColor;
  }

  /**
   * Returns the FEN string for the current position.
   */
  getFen() {
    return this.game.fen();
  }
}

export default BoardApi;
