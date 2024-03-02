import {
  deepMergeConfig,
  getThreats,
  isPromotion,
  chessJSPieceToLichessPiece,
  possibleMoves,
  shortToLongColor,
} from '@/helper/Board';
import { defaultBoardConfig } from '@/helper/DefaultConfig';
import type {
  BrushColor,
  CapturedPieces,
  DrawShape,
  LichessOpening,
  MaterialDifference,
} from '@/typings/BoardAPI';
import type BoardConfig from '@/typings/BoardConfig';
import type {
  BoardState,
  Emits,
  Move,
  MoveEvent,
  PromotedTo,
  Promotion,
  Props,
  SquareColor,
} from '@/typings/Chessboard';
import {
  Chess,
  type Piece,
  type PieceSymbol,
  type Color as ShortColor,
  type Square,
} from 'chess.js';
import type { Api } from 'chessground/api';
import { Chessground } from 'chessground/chessground';
import type { Color, Key, MoveMetadata, Role } from 'chessground/types';
import { nextTick } from 'vue';

/**
 * class for modifying and reading data from the board
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
  private updateGameState({ updateFen = true } = {}): void {
    if (!this.boardState.historyViewerState.isEnabled) {
      if (updateFen) {
        this.board.set({ fen: this.game.fen() });
      }

      this.board.state.turnColor = this.getTurnColor();

      if (this.board.state.movable.free) {
        this.board.state.movable.color = 'both';
        this.board.state.movable.dests = new Map();
      } else {
        this.board.state.movable.color =
          this.props.playerColor || this.board.state.turnColor;
        this.board.state.movable.dests = possibleMoves(this.game);
      }

      this.displayInCheck(this.game.inCheck(), this.board.state.turnColor);

      if (this.boardState.showThreats) {
        this.drawMoves();
      }
    }

    this.emitEvents();
  }

  /**
   * Updates the board state to display whether the king of given color is in check
   * @private
   */
  private displayInCheck(inCheck: boolean, color: Color): void {
    if (inCheck) {
      for (const [key, piece] of this.board.state.pieces) {
        if (piece.role === 'king' && piece.color === color) {
          this.board.state.check = key;
          return;
        }
      }
    } else {
      this.board.state.check = undefined;
    }
  }

  /**
   * emits neccessary events
   * @private
   */
  private emitEvents(): void {
    if (this.game.inCheck()) {
      this.emit(
        this.game.isCheckmate() ? 'checkmate' : 'check',
        this.board.state.turnColor
      );
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
    _: MoveMetadata
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

    // if we were viewing the previous move, this is now the current move, so disable viewer
    if (
      this.boardState.historyViewerState.isEnabled &&
      this.boardState.historyViewerState.plyViewing ===
        this.getCurrentPlyNumber()
    ) {
      this.stopViewingHistory();
    }

    // if we're not viewing history, update the board
    if (!this.boardState.historyViewerState.isEnabled) {
      this.board.set({ fen: undoMove.before });
      this.updateGameState({ updateFen: false });
      const lastMove = this.getLastMove();
      this.board.state.lastMove = lastMove
        ? [lastMove?.from, lastMove?.to]
        : undefined;
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
   * Finds all the captured pieces from the game history.
   *
   * Note: results may be innaccurate if game history has been lost, eg. if
   * setPosition has been called.
   *
   * @returns an object with white and black properties whose values are arrays
   * of all the pieces captured by that player this game.
   */
  getCapturedPieces(): CapturedPieces {
    const capturedPieces: CapturedPieces = {
      white: [],
      black: [],
    };

    for (const { color, captured } of this.getHistory(true)) {
      if (captured) capturedPieces[shortToLongColor(color)].push(captured);
    }

    return capturedPieces;
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
    if (this.boardState.showThreats) {
      this.hideMoves();
    } else {
      this.drawMoves();
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
  move(move: string | Move): boolean {
    let moveEvent: MoveEvent;

    try {
      moveEvent = this.game.move(move);
    } catch {
      if (typeof move === 'object' && this.board.state.movable.free) {
        this.board.move(move.from, move.to);
        this.updateGameState({ updateFen: false });
      }
      return false;
    }

    this.emit('move', moveEvent);
    if (moveEvent?.promotion) {
      this.emit('promotion', {
        color: shortToLongColor(moveEvent.color),
        promotedTo: moveEvent.promotion.toUpperCase() as PromotedTo,
        sanMove: moveEvent.san,
      });
    }

    // Only update board if not viewing history
    if (!this.boardState.historyViewerState.isEnabled) {
      this.board.move(moveEvent.from, moveEvent.to);

      // if move was a promotion or en passant capture, update position
      if (moveEvent.flags === 'e' || moveEvent?.promotion) {
        // if animating, wait until after the animation to update position
        setTimeout(
          () => this.board.set({ fen: moveEvent.after }),
          this.board.state.animation.current
            ? this.board.state.animation.duration
            : 0
        );
      }
      this.updateGameState({ updateFen: false });
      nextTick(this.board.playPremove);
    }

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
   *
   * @returns the current ply number
   * @example e4 e5 Nf3 -> ply number is 3
   */
  getCurrentPlyNumber(): number {
    return (
      2 * this.getCurrentTurnNumber() -
      (this.getTurnColor() === 'black' ? 1 : 2)
    );
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
  getHistory(): string[];
  getHistory(verbose: false): string[];
  getHistory(verbose: true): MoveEvent[];
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

  /**
   * returns true or false depending on if a player is in check
   */
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
    this.boardState.historyViewerState = { isEnabled: false };
    this.updateGameState();
  }

  /**
   * puts a piece on a given square on the board
   * returns true on success, else false
   */
  putPiece(piece: Piece, square: Square): boolean {
    // @TODO using putPiece with the same piece and square twice is buggy in movable: false in chess.js state
    if (this.board.state.movable.free) {
      const current = this.board.state.pieces;
      current.set(square, {
        color: piece.color === 'w' ? 'white' : 'black',
        role: chessJSPieceToLichessPiece[piece.type] as Role,
      });
      this.board.setPieces(current);
      return true;
    } else {
      const result = this.game.put(piece, square);
      if (result) {
        this.updateGameState();
      }
      return result;
    }
  }

  /**
   * Removes a piece from the board.
   * @param square - The square where the piece is located.
   */
  removePiece(square: Square): void {
    const pieces = this.board.state.pieces;
    pieces.delete(square);
    this.game.remove(square);
  }

  /**
   * removes all pieces from the board
   */
  clearBoard(): void {
    this.game.clear();
    this.boardState.historyViewerState = { isEnabled: false };
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
    this.boardState.historyViewerState = { isEnabled: false };
    this.updateGameState();

    // show last move if there is one
    const lastMove = this.getLastMove();
    if (lastMove) {
      this.board.set({ lastMove: [lastMove.from, lastMove.to] });
    }
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
   * Sets a header in the PGN.
   *
   * @param changes a record of key value pairs to change in the PGN, eg. `{ White: 'Deep Blue', Black: 'Kasparov, Garry' }`
   */
  setPgnInfo(changes: { [key: string]: string }): {
    [key: string]: string | undefined;
  } {
    return this.game.header(...Object.entries(changes).flat());
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
      this.board.state.selected = undefined;
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
        : this.changeTurn.bind(this); // in case user provided config with { movable: { events: { after: undefined } } }
    }

    const { fen, ...configWithoutFen } = config;
    this.board.set(configWithoutFen);
    if (fen) this.setPosition(fen);
    this.board.redrawAll();
  }

  /**
   * Views the position at the given ply number in the game's history.
   *
   * @param ply - the ply number of the position to be viewed, where 0 is the initial position, 1 is
   * after white's first move, 2 is after black's first move and so on.
   */
  viewHistory(ply: number): void {
    const history = this.getHistory(true);

    // if given ply is invalid, terminate function
    if (ply < 0 || ply > history.length) return;

    // if animation is enabled and ply is not within 1 of the currently viewed, disable animation
    const disableAnimation =
      this.board.state.animation.enabled &&
      ((this.boardState.historyViewerState.isEnabled &&
        Math.abs(this.boardState.historyViewerState.plyViewing - ply) !== 1) ||
        (!this.boardState.historyViewerState.isEnabled &&
          ply !== history.length - 1));
    if (disableAnimation) {
      this.board.set({ animation: { enabled: false } });
    }

    // if viewing a previous ply, view that position
    if (ply < history.length) {
      if (!this.boardState.historyViewerState.isEnabled) {
        this.boardState.historyViewerState = {
          isEnabled: true,
          plyViewing: ply,
          viewOnly: this.board.state.viewOnly,
        };
      } else {
        this.boardState.historyViewerState.plyViewing = ply;
      }

      this.board.set({
        fen: history[ply].before,
        viewOnly: true,
        lastMove:
          ply > 0 ? [history[ply - 1].from, history[ply - 1].to] : undefined,
        selected: undefined,
      });

      this.displayInCheck(
        ply > 0 ? '+#'.includes(history[ply - 1].san.at(-1) as string) : false,
        shortToLongColor(history[ply].color)
      );

      this.board.cancelPremove();
    } else {
      // else ply is current position, so stop viewing history
      if (this.boardState.historyViewerState.isEnabled) {
        const lastMove = history.at(-1) as MoveEvent;

        this.board.set({
          fen: lastMove.after,
          viewOnly: this.boardState.historyViewerState.viewOnly,
          lastMove: [lastMove.from, lastMove.to],
        });

        this.boardState.historyViewerState = { isEnabled: false };
        this.updateGameState({ updateFen: false });
      }
    }

    // if animation was disabled, reenable it
    if (disableAnimation) this.board.set({ animation: { enabled: true } });
  }

  /**
   * Stops viewing history and returns the board to the present position, ie. after the latest move.
   */
  stopViewingHistory(): void {
    if (this.boardState.historyViewerState.isEnabled) {
      this.viewHistory(this.getCurrentPlyNumber());
    }
  }

  /**
   * Views the starting position of this game.
   */
  viewStart(): void {
    this.viewHistory(0);
  }

  /**
   * If viewing history, views the move after the one currently being viewed.
   * If that move is the latest move, stops viewing history.
   */
  viewNext(): void {
    if (this.boardState.historyViewerState.isEnabled) {
      this.viewHistory(this.boardState.historyViewerState.plyViewing + 1);
    }
  }

  /**
   * If viewing history, views the previous move to the one currently being viewed.
   * Else, starts viewing history and views the move previous to the latest move.
   */
  viewPrevious(): void {
    const ply = this.boardState.historyViewerState.isEnabled
      ? this.boardState.historyViewerState.plyViewing
      : this.getCurrentPlyNumber();
    this.viewHistory(ply - 1);
  }
}

export default BoardApi;
