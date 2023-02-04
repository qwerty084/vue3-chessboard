import type {
  ChessInstance,
  Move,
  Piece,
  PieceColor,
  PieceType,
  Square,
  SquareColor,
} from 'chess.js';
import type { Api } from 'chessground/api';
import type {
  LichessOpening,
  MaterialDifference,
  BrushColor,
  DrawShape,
} from '@/typings/BoardAPI';
import {
  getThreats,
  shortToLongColor,
  possibleMoves,
  roleAbbrToRole,
} from '@/helper/Board';
import { emitBoardEvents } from '@/helper/EmitEvents';
import type { Emit, BoardState } from '@/typings/Chessboard';
import type { Color, Key } from 'chessground/types';

/**
 * class for modifying and reading data from the board, \
 * extends the lichess chessground api & chess.js api \
 * lichess documentation: https://github.com/lichess-org/chessground/blob/master/src/api.ts \
 * chess.js documentation: https://github.com/jhlywa/chess.js/blob/master/README.md
 */
export class BoardApi {
  private game: ChessInstance;
  private board: Api;
  private boardState: BoardState;
  private emit: Emit;
  constructor(
    game: ChessInstance,
    board: Api,
    boardState: BoardState,
    emit: Emit
  ) {
    this.game = game;
    this.board = board;
    this.boardState = boardState;
    this.emit = emit;
  }

  /**
   * Resets the board to the initial starting position.
   */
  resetBoard(): void {
    this.game.reset();
    this.board.set(this.boardState.boardConfig);
    this.board.state.check = undefined;
    this.board.selectSquare(null);
    if (this.boardState.showThreats) {
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    }
  }

  /**
   * undo last move, if possible
   */
  undoLastMove(): void {
    const undoMove = this.game.undo();
    if (undoMove == null) return;
    const lastMove = this.game.history({ verbose: true }).at(-1);

    this.board.set({ fen: this.game.fen() });
    this.board.state.turnColor = shortToLongColor(this.game.turn());

    this.board.state.movable.color = this.board.state.turnColor;
    this.board.state.movable.dests = possibleMoves(this.game);
    this.board.state.check = undefined;

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
  getMaterialCount(): MaterialDifference {
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

  toggleOrientation(): void {
    this.board.toggleOrientation();
  }

  /**
   * draws arrows and circles on the board for possible moves/captures
   */
  drawMoves(): void {
    this.boardState.showThreats = true;
    this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
  }

  /**
   * removes arrows and circles from the board for possible moves/captures
   */
  hideMoves(): void {
    this.boardState.showThreats = false;
    this.board.setShapes([]);
  }

  drawMove(orig: Square, dest: Square, brushColor: BrushColor): void {
    this.board.setShapes([
      {
        orig: orig,
        dest: dest,
        brush: brushColor,
      },
    ]);
  }

  /**
   * toggle drawing of arrows and circles on the board for possible moves/captures
   */
  toggleMoves(): void {
    this.boardState.showThreats = !this.boardState.showThreats;
    if (this.boardState.showThreats) {
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    } else {
      this.board.setShapes([]);
    }
  }

  /**
   * returns the opening name for the current position from lichess api
   */
  async getOpeningName(): Promise<string | null> {
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

  /**
   * make a move programmatically on the board
   * @param move the san move to make like 'e4', 'O-O' or 'e8=Q'
   * @returns true if the move was made, false if the move was illegal
   */
  move(move: string): boolean {
    const m = this.game.move(move);
    if (m == null) return false;
    if (move === 'O-O-O' || move === 'O-O') {
      const currentRow = m.to[1];
      if (move === 'O-O-O') {
        this.board.move(`a${currentRow}` as Key, `d${currentRow}` as Key);
      } else {
        this.board.move(`h${currentRow}` as Key, `f${currentRow}` as Key);
      }
    }

    // check for promotion move
    if (m.promotion) {
      this.board.state.pieces.set(m.to, {
        color: shortToLongColor(m.color),
        role: roleAbbrToRole(m.promotion),
        promoted: true,
      });
      this.board.state.pieces.delete(m.from);
      this.board.redrawAll();
    } else {
      this.board.move(m.from, m.to);
    }

    this.board.state.movable.dests = possibleMoves(this.game);
    this.board.state.turnColor = shortToLongColor(this.game.turn());
    this.board.state.movable.color = this.board.state.turnColor;
    this.board.state.lastMove = [m.from, m.to];

    if (this.boardState.showThreats) {
      // redraw threats in new position if enabled
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    }
    emitBoardEvents(this.game, this.board, this.emit);

    return true;
  }

  /**
   * returns the current turn color
   * @returns 'white' or 'black'
   */
  getTurnColor(): Color {
    return this.board.state.turnColor;
  }

  /**
   * returns all possible moves for the current position
   *
   */
  getPossibleMoves(): Map<Key, Key[]> | undefined {
    return possibleMoves(this.game);
  }

  /**
   *
   * @returns the current turn number
   * @example e4 e5 -> turn number is 2 now
   */
  getCurrentTurnNumber(): number {
    // return Math.ceil(this.game.history().length / 2);
    let movesLength = this.game.history().length;
    if (movesLength % 2 === 0 && movesLength !== 0) {
      movesLength += 1;
    }

    return Math.ceil(movesLength / 2);
  }

  getLastMove(): Move | undefined {
    return this.game.history({ verbose: true }).at(-1);
  }

  /**
   * Retrieves the move history.
   *
   * @param verbose - passing true will add more info
   * @example Verbose: [{"color": "w", "from": "e2", "to": "e4", "flags": "b", "piece": "p", "san": "e4"}],  without verbose flag: [ "e7", "e5" ]
   */
  getHistory(verbose = false): Move[] | string[] {
    return this.game.history({ verbose: verbose });
  }

  /**
   * Returns the FEN string for the current position.
   */
  getFen(): string {
    return this.board.getFen();
  }

  /**
   * Returns the board position as a 2D array.
   */
  getBoardPosition(): ({
    type: PieceType;
    color: PieceColor;
    square: Square;
  } | null)[][] {
    return this.game.board();
  }

  /**
   * returns the PGN string for the current position.
   */
  getPgn(): string {
    return this.game.pgn();
  }

  /**
   * returns true of false depending on if the game is over
   */
  getIsGameOver(): boolean {
    return this.game.game_over();
  }

  /**
   * returns true or false depending on if a player is checkmated
   */
  getIsCheckmate(): boolean {
    return this.game.in_checkmate();
  }

  /**
   * returns true or false depending on if a player is in stalemate
   */
  getIsStalemate(): boolean {
    return this.game.in_stalemate();
  }

  /**
   * returns true or false depending on if a game is drawn
   */
  getIsDraw(): boolean {
    return this.game.in_draw();
  }

  /**
   * returns true or false depending on if a game is drawn by threefold repetition
   */
  getIsThreefoldRepetition(): boolean {
    return this.game.in_threefold_repetition();
  }

  /**
   * returns true or false depending on if a game is drawn by insufficient material
   */
  getIsInsufficientMaterial(): boolean {
    return this.game.insufficient_material();
  }

  /**
   * returns the color of a given square
   */
  getSquareColor(square: string): SquareColor | null {
    return this.game.square_color(square);
  }

  /**
   * Returns the piece on the square or null if there is no piece
   */
  getSquare(square: Square): Piece | null {
    return this.game.get(square);
  }

  /**
   * Returns the piece on the square or null if there is no piece
   */
  setPosition(fen: string) {
    this.game.load(fen);
    // update board state
  }

  /**
   * puts a piece on a given square on the board
   * returns true on success, else false
   */
  putPiece(piece: Piece, square: Square): boolean {
    return this.game.put(piece, square);
  }

  /**
   * removes all pieces from the board
   */
  clearBoard(): void {
    this.game.clear();
  }

  setShapes(shapes: DrawShape[]): void {
    this.board.setShapes(shapes);
  }

  /**
   * loads a pgn into the board
   *
   * @param pgn - the pgn to load
   */
  loadPgn(pgn: string): void {
    this.game.load_pgn(pgn);
    this.board.set({ fen: this.game.fen() });
    this.board.state.turnColor = shortToLongColor(this.game.turn());

    this.board.state.movable.color = this.board.state.turnColor;
    this.board.state.movable.dests = possibleMoves(this.game);
    this.board.state.check = undefined;
  }

  /**
   * returns the header information of the current pgn, if no pgn is loaded, returns an empty object
   * @example {
   * "Event": "IBM Kasparov vs. Deep Blue Rematch",
   * "Site": "New York, NY USA",
   * "Date": "1997.05.11",
   * "Round": "6",
   * "White": "Deep Blue",
   * "Black": "Kasparov, Garry",
   * "Opening": "Caro-Kann: 4...Nd7",
   * "ECO": "B17",
   * "Result": "1-0"
   * }
   */
  getPgnInfo(): {
    [key: string]: string | undefined;
  } {
    return this.game.header();
  }
}

export default BoardApi;
