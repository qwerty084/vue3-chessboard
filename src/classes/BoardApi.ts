import {
  Chess,
  type Piece,
  type PieceSymbol,
  type Square,
  type Color as ShortColor,
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
  deepMergeConfig,
  isPromotion,
} from '@/helper/Board';
import type {
  Move,
  MoveEvent,
  Props,
  Emits,
  BoardState,
  PromotedTo,
  SquareColor,
  Promotion,
} from '@/typings/Chessboard';
import type { Color, Key, MoveMetadata } from 'chessground/types';
import type BoardConfig from '@/typings/BoardConfig';
import { defaultBoardConfig } from '@/helper/DefaultConfig';
import { Chessground } from 'chessground/chessground';

/**
 * class for modifying and reading data from the board, \
 * extends the lichess chessground api & chess.js api \
 * lichess documentation: https://github.com/lichess-org/chessground/blob/master/src/api.ts \
 * chess.js documentation: https://github.com/jhlywa/chess.js/blob/master/README.md
 */
export class BoardApi {
  private game: Chess;
  private board: Api;
  private boardState: BoardState;
  private props: Props;
  private emit: Emits;
  constructor(
    boardElement: HTMLElement,
    boardState: BoardState,
    props: Props,
    emit: Emits
  ) {
    this.boardState = boardState;
    this.props = props;
    this.emit = emit;
    this.game = new Chess();
    this.board = Chessground(boardElement);
    this.resetBoard();
  }

  //
  //  PRIVATE INTERAL METHODS:
  //

  /**
   * syncs chess.js state with the board
   * @private
   */
  private updateGameState(): void {
    this.board.set({ fen: this.game.fen() });
    this.board.state.turnColor = this.getTurnColor();
    this.board.state.movable.color =
      this.props.playerColor || this.board.state.turnColor;
    this.board.state.movable.dests = possibleMoves(this.game);

    if (this.boardState.showThreats) {
      this.board.setShapes(getThreats(this.game.moves({ verbose: true })));
    }

    this.emitEvents();
  }

  /**
   * emits neccessary events
   * @private
   */
  private emitEvents(): void {
    const lastMove = this.getLastMove();
    if (lastMove) {
      this.emit('move', lastMove);
    }

    if (lastMove?.promotion) {
      this.emit('promotion', {
        color: shortToLongColor(lastMove.color),
        promotedTo: lastMove.promotion.toUpperCase() as PromotedTo,
        sanMove: lastMove.san,
      });
    }

    if (this.game.inCheck()) {
      for (const [key, piece] of this.board.state.pieces) {
        if (
          piece.role === 'king' &&
          piece.color === this.board?.state.turnColor
        ) {
          this.board.state.check = key;
          this.emit(
            this.game.isCheckmate() ? 'checkmate' : 'check',
            this.board.state.turnColor
          );
          break;
        }
      }
    } else {
      this.board.state.check = undefined;
    }

    if (this.game.isDraw()) {
      this.emit('draw');
    }

    if (this.game.isStalemate()) {
      this.emit('stalemate');
    }
  }

  /**
   * Changes the turn of the game, triggered by config.movable.events.after
   * @private
   */
  private async changeTurn(
    orig: Key,
    dest: Key,
    _metadata: MoveMetadata
  ): Promise<void> {
    let selectedPromotion: Promotion | undefined = undefined;

    if (isPromotion(dest, this.game.get(orig as Square))) {
      selectedPromotion = await new Promise((resolve) => {
        this.boardState.promotionDialogState = {
          isEnabled: true,
          color: this.getTurnColor(),
          callback: resolve,
        };
      });
    }

    this.move({
      from: orig,
      to: dest,
      promotion: selectedPromotion,
    });
  }

  //
  //  PUBLIC API METHODS:
  //

  /**
   * Resets the board to the initial starting configuration.
   */
  resetBoard(): void {
    this.setConfig(this.props.boardConfig as BoardConfig, true);
  }

  /**
   * undo last move, if possible
   */
  undoLastMove(): void {
    const undoMove = this.game.undo();
    if (undoMove == null) return;

    this.updateGameState();
    const lastMove = this.getLastMove();
    if (lastMove) {
      this.board.state.lastMove = [lastMove?.from, lastMove?.to];
    } else {
      this.board.state.lastMove = undefined;
    }
  }

  /**
   * returns the current material count for white, black and the diff.
   * If diff > 0 white is leading, else black.
   */
  getMaterialCount(): MaterialDifference {
    const pieces = this.board.state.pieces;
    const piecesValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,
    };

    const materialCount = {
      materialWhite: 0,
      materialBlack: 0,
      materialDiff: 0,
    };

    for (const piece of pieces) {
      if (piece[1].color === 'white') {
        materialCount.materialWhite += piecesValues[piece[1].role];
      } else {
        materialCount.materialBlack += piecesValues[piece[1].role];
      }
    }
    materialCount.materialDiff =
      materialCount.materialWhite - materialCount.materialBlack;

    return materialCount;
  }

  /**
   * toggles the board orientation.
   */
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

  /**
   * draws an arrow on the board
   */
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
      const history = this.game
        .history({ verbose: true })
        .map((move) => move.lan)
        .join(',');
      const res = await fetch(
        `https://explorer.lichess.ovh/masters?play=${history}`
      );
      const data: LichessOpening = await res.json();

      return data.opening?.name ?? null;
    } catch {
      return null;
    }
  }

  /**
   * make a move programmatically on the board
   * @param move either a string in Standard Algebraic Notation (SAN), eg. 'e4', 'exd5', 'O-O', 'Nf3' or 'e8=Q'
   * or an object of shape { from: string; to: string; promotion?: string; }, eg. { from: 'g8', to: 'f6' } or
   * { from: 'e7', to: 'e8', promotion: 'q'}
   * @returns true if the move was made, false if the move was illegal
   */
  move(move: Move): boolean {
    let moveEvent: MoveEvent;

    // TODO: handle exception based on boardConfig.movable.free
    try {
      moveEvent = this.game.move(move);
    } catch {
      return false;
    }

    this.board.move(moveEvent.from, moveEvent.to);
    this.updateGameState();

    return true;
  }

  /**
   * returns the current turn color
   * @returns 'white' or 'black'
   */
  getTurnColor(): Color {
    return shortToLongColor(this.game.turn());
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
   * @example e4 e5 -> turn number is 2
   */
  getCurrentTurnNumber(): number {
    return this.game.moveNumber();
  }

  /**
   * returns the latest move made on the board
   */
  getLastMove(): MoveEvent | undefined {
    return this.game.history({ verbose: true }).at(-1);
  }

  /**
   * Retrieves the move history.
   *
   * @param verbose - passing true will add more info
   * @example Verbose: [{"color": "w", "from": "e2", "to": "e4", "flags": "b", "piece": "p", "san": "e4"}],  without verbose flag: [ "e7", "e5" ]
   */
  getHistory(verbose = false): MoveEvent[] | string[] {
    return this.game.history({ verbose: verbose });
  }

  /**
   * Returns the FEN string for the current position.
   */
  getFen(): string {
    return this.game.fen();
  }

  /**
   * Returns the board position as a 2D array.
   */
  getBoardPosition(): ({
    square: Square;
    type: PieceSymbol;
    color: ShortColor;
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
    return this.game.isGameOver();
  }

  /**
   * returns true or false depending on if a player is checkmated
   */
  getIsCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  getIsCheck(): boolean {
    return this.game.isCheck();
  }

  /**
   * returns true or false depending on if a player is in stalemate
   */
  getIsStalemate(): boolean {
    return this.game.isStalemate();
  }

  /**
   * returns true or false depending on if a game is drawn
   */
  getIsDraw(): boolean {
    return this.game.isDraw();
  }

  /**
   * returns true or false depending on if a game is drawn by threefold repetition
   */
  getIsThreefoldRepetition(): boolean {
    return this.game.isThreefoldRepetition();
  }

  /**
   * returns true or false depending on if a game is drawn by insufficient material
   */
  getIsInsufficientMaterial(): boolean {
    return this.game.isInsufficientMaterial();
  }

  /**
   * returns the color of a given square
   */
  getSquareColor(square: Square): SquareColor {
    return this.game.squareColor(square);
  }

  /**
   * Returns the piece on the square or null if there is no piece
   */
  getSquare(square: Square): Piece | null {
    return this.game.get(square);
  }

  /**
   * loads a fen into the board
   * Caution: this will erase the game history. To set position with history call loadPgn with a pgn instead
   */
  setPosition(fen: string): void {
    this.game.load(fen);
    this.updateGameState();
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
    this.updateGameState();
  }

  /**
   * draw multiple arrows on the board
   */
  setShapes(shapes: DrawShape[]): void {
    this.board.setShapes(shapes);
  }

  /**
   * loads a pgn into the board
   *
   * @param pgn - the pgn to load
   */
  loadPgn(pgn: string): void {
    this.game.loadPgn(pgn);
    this.updateGameState();
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

  /**
   * Sets the config of the board.
   * Caution: providing a config with a fen will erase the game history and change the starting position
   * for resetBoard. To keep history and starting position: omit fen from the given config and call
   * loadPgn with a pgn instead.
   *
   * @param config - a subset of config options, eg. `{ viewOnly: true, animation: { enabled: false } }`
   * or `{ movable: { events: { after: afterFunc }, showDests: false }, drawable: { enabled: false } }`
   * @param fillDefaults - if true unprovided config options will be substituted with default values, if
   * false the unprovided options will remain unchanged.
   */
  setConfig(config: BoardConfig, fillDefaults = false): void {
    if (fillDefaults) {
      config = deepMergeConfig(defaultBoardConfig, config);
    }

    // If user provided a movable.events.after function we patch changeTurn to run before it. We want
    // changeTurn to run before the user's function rather than after it so that during their function
    // call the API can provide correct data about the game, eg. getLastMove() for the san.
    if (config.movable?.events && 'after' in config.movable.events) {
      const userAfter = config.movable.events.after;
      config.movable.events.after = userAfter
        ? async (...args): Promise<void> => {
            await this.changeTurn(...args);
            userAfter(...args);
          }
        : this.changeTurn; // in case user provided config with { movable: { event: { after: undefined } } }
    }
    const { fen, ...configWithoutFen } = config;
    this.board.set(configWithoutFen);
    if (fen) this.setPosition(fen);
    this.board.redrawAll();
  }
}

export default BoardApi;
