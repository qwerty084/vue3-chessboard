import type { BoardApi } from '@/classes/BoardApi';
import { initialPos } from '@/helper/DefaultConfig';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeStalemate, mountComponent, resetBoard } from './helper/Helper';

describe('Test the board API', () => {
  const wrapper = mountComponent();
  const boardApi = wrapper.emitted<BoardApi[]>('boardCreated')?.[0][0];
  if (typeof boardApi === 'undefined') {
    throw new Error('No board api emitted');
  }

  // reset the board and events after each test
  beforeEach(() => resetBoard(wrapper, boardApi));

  it('emits board api', () => {
    expect(boardApi).toBeTruthy();
  });

  it('resets the board', () => {
    expect(boardApi?.getFen()).toBe(initialPos);
    expect(boardApi?.getCurrentTurnNumber()).toBe(1);
    expect(boardApi.getLastMove()).toBeUndefined();
    expect(boardApi?.getHistory()).toHaveLength(0);
  });

  it('undoes moves', () => {
    boardApi?.move('e4');
    boardApi?.undoLastMove();

    expect(boardApi?.getTurnColor()).toBe('white');
    expect(boardApi?.getCurrentTurnNumber()).toBe(1);
    expect(boardApi?.getFen()).toBe(initialPos);
    expect(boardApi.getHistory()).toHaveLength(0);

    // @TODO test if event emitted after undo
  });

  it('returns the current turn color', () => {
    boardApi.move('e4');
    expect(boardApi?.getTurnColor()).toBe('black');
    boardApi.undoLastMove();
    expect(boardApi?.getTurnColor()).toBe('white');
    boardApi.move('e4');
    boardApi.move('e5');
    expect(boardApi?.getTurnColor()).toBe('white');
    resetBoard(wrapper, boardApi);
    expect(boardApi.getTurnColor()).toBe('white');
  });

  it('returns the correct material count', () => {
    const initialMaterialCount = boardApi.getMaterialCount();

    expect(initialMaterialCount.materialWhite).toBe(39);
    expect(initialMaterialCount.materialBlack).toBe(39);
    expect(initialMaterialCount.materialDiff).toBe(0);

    boardApi.move('e2e4');
    boardApi.move('d7d5');
    boardApi.move('exd5');
    const materialCountAfterExchange = boardApi.getMaterialCount();

    expect(materialCountAfterExchange.materialWhite).toBe(39);
    expect(materialCountAfterExchange.materialBlack).toBe(38);
    expect(materialCountAfterExchange.materialDiff).toBe(1);

    boardApi.resetBoard();
    const materialCountAfterReset = boardApi.getMaterialCount();

    expect(materialCountAfterReset.materialWhite).toBe(39);
    expect(materialCountAfterReset.materialBlack).toBe(39);
    expect(materialCountAfterReset.materialDiff).toBe(0);
  });

  it('returns the captured pieces', () => {
    expect(boardApi.getCapturedPieces()).toEqual({ white: [], black: [] });
    boardApi.move('e4');
    boardApi.move('d5');
    boardApi.move('exd5');
    expect(boardApi.getCapturedPieces()).toEqual({ white: ['p'], black: [] });
    boardApi.move('Qxd5');
    expect(boardApi.getCapturedPieces()).toEqual({
      white: ['p'],
      black: ['p'],
    });
    boardApi.move('c4');
    boardApi.move('e6');
    boardApi.move('cxd5');
    expect(boardApi.getCapturedPieces()).toEqual({
      white: ['p', 'q'],
      black: ['p'],
    });
    boardApi.move('exd5');
    expect(boardApi.getCapturedPieces()).toEqual({
      white: ['p', 'q'],
      black: ['p', 'p'],
    });
    boardApi.move('Bc4');
    boardApi.move('dxc4');
    expect(boardApi.getCapturedPieces()).toEqual({
      white: ['p', 'q'],
      black: ['p', 'p', 'b'],
    });
  });

  it('returns the current turn number', () => {
    boardApi.move('e4');
    expect(boardApi?.getCurrentTurnNumber()).toBe(1);
    boardApi.undoLastMove();
    expect(boardApi?.getCurrentTurnNumber()).toBe(1);
    boardApi.move('e4');
    boardApi.move('e5');
    expect(boardApi?.getCurrentTurnNumber()).toBe(2);
    boardApi.move('Nf3');
    boardApi.move('Nc6');
    expect(boardApi?.getCurrentTurnNumber()).toBe(3);
    boardApi.resetBoard();
    expect(boardApi.getCurrentTurnNumber()).toBe(1);
  });

  it('should make a move programatically', () => {
    boardApi.move('e4');
    expect(boardApi.getIsGameOver()).toBe(false);
    expect(boardApi.getFen()).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
    expect(boardApi.getTurnColor()).toBe('black');

    // test for events after move
    resetBoard(wrapper, boardApi);

    // test checkmate
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('Qh5');
    boardApi.move('c5');
    boardApi.move('Bc4');
    boardApi.move('b5');
    boardApi.move('Qxf7#');
    expect(boardApi.getIsCheckmate()).toBe(true);
    expect(boardApi.getIsGameOver()).toBe(true);
    expect(wrapper.emitted('checkmate')).toHaveLength(1);

    // test check
    resetBoard(wrapper, boardApi);
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('Nc3');
    boardApi.move('f6');
    boardApi.move('Qh5+');
    expect(boardApi.getIsCheck()).toBe(true);
    expect(boardApi.getIsGameOver()).toBe(false);
    expect(wrapper.emitted('check')).toHaveLength(1);

    // test draw
    resetBoard(wrapper, boardApi);
    makeStalemate(boardApi);
    expect(boardApi.getIsStalemate()).toBe(true);
    expect(boardApi.getIsGameOver()).toBe(true);
    expect(boardApi.getIsDraw()).toBe(true);
    expect(wrapper.emitted('draw')).toHaveLength(1);
    expect(wrapper.emitted('stalemate')).toHaveLength(1);
  });

  it('should update board with pgn', () => {
    const pgn = '1. e4 e5';

    boardApi.loadPgn(pgn);

    expect(boardApi.getFen()).toBe(
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'
    );
    expect(boardApi?.getPgn()).toBe(pgn);
    expect(boardApi.getTurnColor()).toBe('white');
    expect(boardApi.getCurrentTurnNumber()).toBe(2);
  });

  it('should return the last move', () => {
    expect(boardApi.getLastMove()).toBe(undefined);
    boardApi.move('e4');
    // chess.js returns a Move instance with undefined captured and promotion keys, which toStrictEqual rejects
    expect(boardApi.getLastMove()).toEqual({
      color: 'w',
      piece: 'p',
      from: 'e2',
      to: 'e4',
      san: 'e4',
      flags: 'b',
      lan: 'e2e4',
      before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    });
    boardApi.move('e5');
    expect(boardApi.getLastMove()).toEqual({
      color: 'b',
      piece: 'p',
      from: 'e7',
      to: 'e5',
      san: 'e5',
      flags: 'b',
      lan: 'e7e5',
      before: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      after: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    });
    boardApi.resetBoard();
    expect(boardApi.getLastMove()).toBe(undefined);
  });

  it('loads a fen correctly', () => {
    let fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    boardApi.setPosition(fen);
    expect(boardApi?.getFen()).toBe(fen);
    expect(boardApi.getSquare('e4')).toStrictEqual({
      type: 'p',
      color: 'w',
    });
    expect(boardApi.getSquare('e3')).toBeNull();
    expect(boardApi.getTurnColor()).toBe('white');
    expect(boardApi.getCurrentTurnNumber()).toBe(2);
    expect(boardApi.move('d7')).toBeFalsy();

    // check for check event with fen
    resetBoard(wrapper, boardApi);
    boardApi.setPosition(
      'rnbqkbnr/pppp2pp/8/4pp1Q/4PP2/8/PPPP2PP/RNB1KBNR b KQkq - 1 3'
    );
    expect(boardApi.getTurnColor()).toBe('black');
    expect(boardApi.getCurrentTurnNumber()).toBe(3);
    expect(boardApi.move('d7')).toBeFalsy();
    expect(wrapper.emitted('check')).toHaveLength(1);

    // check for draw event with fen
    resetBoard(wrapper, boardApi);
    fen = '8/8/4k3/8/4K3/8/8/8 w - - 0 1';
    boardApi.setPosition(fen);

    expect(boardApi.getIsDraw()).toBeTruthy();
    expect(boardApi.getIsGameOver()).toBeTruthy();
    expect(wrapper.emitted('draw')).toHaveLength(1);

    // check for checkmate event with fen
    resetBoard(wrapper, boardApi);
    boardApi.setPosition(
      'rnbqkbnr/p1p2Qpp/1p1p4/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4'
    );
    expect(boardApi.getCurrentTurnNumber()).toBe(4);
    expect(boardApi.getIsGameOver()).toBeTruthy();
    expect(boardApi.getIsCheckmate()).toBeTruthy();
    expect(wrapper.emitted('checkmate')).toHaveLength(1);
    expect(boardApi.move('c7c5')).toBeFalsy();
  });

  it('handles short castling correctly', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('Bc4');
    boardApi.move('Bc5');
    boardApi.move('Nf3');
    boardApi.move('Nf6');
    expect(boardApi.move('O-O')).toBeTruthy();
  });

  it('handles long castling correctly', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('Qe2');
    boardApi.move('d6');
    boardApi.move('Nc3');
    boardApi.move('c6');
    boardApi.move('d4');
    boardApi.move('c5');
    boardApi.move('Bd2');
    boardApi.move('b6');
    expect(boardApi.move('O-O-O')).toBeTruthy();
  });

  it('handles promotions correctly', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('d4');
    boardApi.move('exd4');
    boardApi.move('c3');
    boardApi.move('dxc3');
    boardApi.move('Qd2');
    boardApi.move('cxb2');
    boardApi.move('Qd3');
    boardApi.move('bxa1=Q');
    expect(wrapper.emitted('promotion')?.[0][0]).toStrictEqual({
      color: 'black',
      promotedTo: 'Q',
      sanMove: 'bxa1=Q',
    });
    expect(wrapper.emitted('promotion')).toHaveLength(1);
  });

  it('sets new config correctly ', () => {
    expect((boardApi as any).board.state.movable?.events?.after).toBeTruthy();
    expect((boardApi as any).board.state.animation.enabled).toBe(true);
    expect((boardApi as any).board.state.animation.duration).toBe(300);
    expect((boardApi as any).board.state.drawable.enabled).toBe(true);
    boardApi.setConfig({
      movable: { events: { after: undefined } },
      animation: { enabled: false, duration: 200 },
      drawable: { visible: false },
    });
    // test patching of after when undefined
    expect((boardApi as any).board.state.movable?.events?.after).toBeTruthy();
    expect((boardApi as any).board.state.animation.enabled).toBe(false);
    expect((boardApi as any).board.state.animation.duration).toBe(200);
    expect((boardApi as any).board.state.animation.enabled).toBe(false);
    expect((boardApi as any).board.state.drawable.enabled).toBe(true);
    expect((boardApi as any).board.state.drawable.visible).toBe(false);
  });

  /**
   * History Viewer Tests:
   */
  it('views game history', () => {
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      false
    );
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('d4');
    boardApi.move('exd4');
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      false
    );
    boardApi.viewHistory(1);
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      true
    );
    expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(1);
    expect((boardApi as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('views the previous move when not viewing history', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.viewPrevious();
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      true
    );
    expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(1);
    expect((boardApi as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('views the previous move when already viewing history', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.viewPrevious();
    boardApi.viewPrevious();
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      true
    );
    expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(0);
    expect((boardApi as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
  });

  it('views the next move when viewing history', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.viewHistory(0);
    boardApi.viewNext();
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      true
    );
    expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(1);
    expect((boardApi as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('views the first turn', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.viewStart();
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      true
    );
    expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(0);
    expect((boardApi as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
  });

  it('stops viewing history', () => {
    boardApi.move('e4');
    boardApi.viewHistory(0);
    boardApi.stopViewingHistory();
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      false
    );
    expect((boardApi as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('enableds viewOnly when viewing history', () => {
    expect((boardApi as any).board.state.viewOnly).toBe(false);
    boardApi.move('e4');
    boardApi.viewHistory(0);
    expect((boardApi as any).board.state.viewOnly).toBe(true);
  });

  it('disableds viewOnly when stopping viewing history if it should be disabled', () => {
    expect((boardApi as any).board.state.viewOnly).toBe(false);
    boardApi.move('e4');
    boardApi.viewHistory(0);
    boardApi.stopViewingHistory();
    expect((boardApi as any).board.state.viewOnly).toBe(false);
  });

  it('keeps viewOnly enabled when stopping viewing history if it should be enabled', () => {
    boardApi.setConfig({ viewOnly: true });
    expect((boardApi as any).board.state.viewOnly).toBe(true);
    boardApi.move('e4');
    boardApi.viewHistory(0);
    boardApi.stopViewingHistory();
    expect((boardApi as any).board.state.viewOnly).toBe(true);
  });

  it('keeps animation enabled if it should be enabled', () => {
    expect((boardApi as any).board.state.animation.enabled).toBe(true);
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.viewStart();
    expect((boardApi as any).board.state.animation.enabled).toBe(true);
    boardApi.stopViewingHistory();
    expect((boardApi as any).board.state.animation.enabled).toBe(true);
  });

  describe('history viewer with a custom starting position', () => {
    const startFen =
      'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3';
    const pgn = `[SetUp "1"]\n[FEN "${startFen}"]\n\n3... a6 4. Ba4 Nf6`;
    const currentFen =
      'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5';

    beforeEach(() => boardApi.loadPgn(pgn));

    it('keeps the ply number relative to the FEN move number', () => {
      expect(boardApi.getHistory()).toHaveLength(3);
      expect(boardApi.getCurrentPlyNumber()).toBe(8);
    });

    it('views the previous move when not viewing history', () => {
      boardApi.viewPrevious();
      expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
        true
      );
      expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(
        2
      );
      expect((boardApi as any).board.state.fen).toBe(
        boardApi.getHistory(true)[2].before
      );
    });

    it('views the start position', () => {
      boardApi.viewStart();
      expect((boardApi as any).board.state.fen).toBe(startFen);
    });

    it('returns to the current position with viewNext', () => {
      boardApi.viewPrevious();
      boardApi.viewNext();
      expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
        false
      );
      expect((boardApi as any).board.state.fen).toBe(currentFen);
    });

    it('stops viewing history', () => {
      boardApi.viewStart();
      boardApi.stopViewingHistory();
      expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
        false
      );
      expect((boardApi as any).board.state.fen).toBe(currentFen);
    });

    it('stops viewing history when undoing to the viewed position', () => {
      boardApi.viewPrevious();
      boardApi.undoLastMove();
      expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
        false
      );
      expect(boardApi.getHistory()).toHaveLength(2);
    });

    it('restores the starting position when undoing the only move', () => {
      boardApi.loadPgn(`[SetUp "1"]\n[FEN "${startFen}"]\n\n3... a6`);
      boardApi.viewStart();
      boardApi.undoLastMove();
      expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
        false
      );
      expect(boardApi.getHistory()).toHaveLength(0);
      expect((boardApi as any).board.getFen()).toBe(startFen.split(' ')[0]);
      expect((boardApi as any).board.state.viewOnly).toBe(false);
    });
  });

  describe('history viewer with a starting position in check', () => {
    // white king on e1 is in check from the rook on e8
    const startFen = '4r1k1/8/8/8/8/8/8/4K3 w - - 0 1';
    const pgn = `[SetUp "1"]\n[FEN "${startFen}"]\n\n1. Kd1 Kg7`;

    beforeEach(() => boardApi.loadPgn(pgn));

    it('highlights check when viewing the start position', () => {
      boardApi.viewStart();
      expect((boardApi as any).board.state.check).toBe('e1');
    });

    it('clears the check highlight when viewing a position without check', () => {
      boardApi.viewStart();
      boardApi.viewNext();
      expect((boardApi as any).board.state.check).toBeUndefined();
    });
  });

  it('views the history of an edited position without kings', () => {
    boardApi.clearBoard();
    boardApi.putPiece({ type: 'p', color: 'w' }, 'e2');
    boardApi.putPiece({ type: 'p', color: 'b' }, 'e7');
    boardApi.move('e4');
    boardApi.move('e5');

    expect(() => boardApi.viewStart()).not.toThrow();
    expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(0);
    expect((boardApi as any).board.state.check).toBeUndefined();
    expect((boardApi as any).board.state.animation.enabled).toBe(true);
  });

  describe('history viewer with a custom starting position, white to move', () => {
    const startFen =
      'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4';
    const pgn = `[SetUp "1"]\n[FEN "${startFen}"]\n\n4. Ba4 Nf6 5. O-O`;

    beforeEach(() => boardApi.loadPgn(pgn));

    it('navigates back and forth and returns to the current position', () => {
      const history = boardApi.getHistory(true);
      boardApi.viewPrevious();
      boardApi.viewPrevious();
      expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(
        1
      );
      expect((boardApi as any).board.getFen()).toBe(
        history[1].before.split(' ')[0]
      );

      boardApi.viewNext();
      expect((boardApi as any).boardState.historyViewerState.plyViewing).toBe(
        2
      );

      boardApi.viewNext();
      expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
        false
      );
      expect((boardApi as any).board.getFen()).toBe(
        boardApi.getFen().split(' ')[0]
      );
    });
  });

  it('stops viewing history when undoing the only move', () => {
    boardApi.move('e4');
    boardApi.viewStart();
    boardApi.undoLastMove();
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      false
    );
    expect((boardApi as any).board.state.fen).toBe(initialPos);
  });

  it('resets coordinatesOnSquares to its default', () => {
    const state = (boardApi as any).board.state;
    boardApi.setConfig({ coordinates: true, coordinatesOnSquares: true });
    expect(state.coordinatesOnSquares).toBe(true);
    boardApi.setConfig({}, true);
    expect(state.coordinatesOnSquares).toBe(false);
  });

  it('renders coordinates on squares only together with coordinates', () => {
    boardApi.setConfig({ coordinatesOnSquares: true });
    expect(wrapper.findAll('coords')).toHaveLength(0);

    boardApi.setConfig({ coordinates: true });
    const columns = wrapper.findAll('coords.squares');
    expect(columns).toHaveLength(8);
    expect(columns[0].text()).toBe('a1a2a3a4a5a6a7a8');
  });

  it('leaves the board unchanged when setConfig gets an invalid fen', () => {
    const state = (boardApi as any).board.state;
    const fen = boardApi.getFen();
    expect(() =>
      boardApi.setConfig({
        orientation: 'black',
        fen: '4P1k1/8/8/8/8/8/8/4K3 w - - 0 1',
      })
    ).toThrow();
    expect(state.orientation).toBe('white');
    expect(boardApi.getFen()).toBe(fen);
  });

  it('rejects null moves', () => {
    const fen = boardApi.getFen();
    expect(boardApi.move('--')).toBe(false);
    expect(boardApi.getFen()).toBe(fen);
    expect(boardApi.getHistory()).toEqual([]);
  });

  it('emits check for a move made while viewing history', () => {
    boardApi.move('e4');
    boardApi.move('f6');
    boardApi.viewStart();
    boardApi.move('Qh5');
    expect(wrapper.emitted('check')).toEqual([['black']]);
  });

  it('emits checkmate for a move made while viewing history', () => {
    boardApi.move('f3');
    boardApi.move('e5');
    boardApi.move('g4');
    boardApi.viewStart();
    boardApi.move('Qh4');
    expect(wrapper.emitted('checkmate')).toEqual([['white']]);
  });

  it('emits check once when the history viewer closes after a checking move', () => {
    boardApi.move('e4');
    boardApi.move('f6');
    boardApi.viewStart();
    boardApi.move('Qh5');
    boardApi.stopViewingHistory();
    expect(wrapper.emitted('check')).toHaveLength(1);
  });

  it('does not emit checkmate again when navigating history', () => {
    boardApi.move('f3');
    boardApi.move('e5');
    boardApi.move('g4');
    boardApi.move('Qh4');
    boardApi.viewPrevious();
    boardApi.viewNext();
    expect(wrapper.emitted('checkmate')).toHaveLength(1);
  });

  it('does not emit game events when removing a piece', () => {
    boardApi.move('e4');
    boardApi.move('f6');
    boardApi.move('Qh5');
    boardApi.removePiece('a7');
    expect(wrapper.emitted('check')).toHaveLength(1);
  });

  it('castles when the king is moved onto its own rook', async () => {
    boardApi.setPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const board = (boardApi as any).board;
    expect(board.state.movable.dests.get('e1')).toEqual(
      expect.arrayContaining(['g1', 'h1', 'c1', 'a1'])
    );

    board.selectSquare('e1');
    board.selectSquare('h1');
    // chessground calls movable.events.after in a timeout
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(boardApi.getFen()).toBe('r3k2r/8/8/8/8/8/8/R4RK1 b kq - 1 1');
    expect(boardApi.getLastMove()?.san).toBe('O-O');
  });

  it('does not list the rook square with movable.rookCastle disabled', () => {
    boardApi.setConfig({ movable: { rookCastle: false } });
    boardApi.setPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const dests = (boardApi as any).board.state.movable.dests.get('e1');
    expect(dests).toEqual(expect.arrayContaining(['g1', 'c1']));
    expect(dests).not.toContain('h1');
    expect(dests).not.toContain('a1');
  });

  it('does not list the rook square with autoCastle disabled', () => {
    boardApi.setConfig({ autoCastle: false });
    boardApi.setPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const dests = (boardApi as any).board.state.movable.dests.get('e1');
    expect(dests).toEqual(expect.arrayContaining(['g1', 'c1']));
    expect(dests).not.toContain('h1');
    expect(dests).not.toContain('a1');
  });

  it('updates the rook square destinations when the castling options change', () => {
    boardApi.setPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const board = (boardApi as any).board;

    boardApi.setConfig({ movable: { rookCastle: false } });
    expect(board.state.movable.dests.get('e1')).not.toContain('h1');
    boardApi.setConfig({ movable: { rookCastle: true } });
    expect(board.state.movable.dests.get('e1')).toContain('h1');
    boardApi.setConfig({ autoCastle: false });
    expect(board.state.movable.dests.get('e1')).not.toContain('h1');
    boardApi.setConfig({ autoCastle: true });
    expect(board.state.movable.dests.get('e1')).toContain('h1');
  });

  it('does not castle a king dropped onto its rook from another square in free mode', async () => {
    boardApi.setConfig({ movable: { free: true } });
    boardApi.setPosition('4k3/8/8/8/5K1R/8/8/8 w - - 0 1');
    const board = (boardApi as any).board;

    board.selectSquare('f4');
    board.selectSquare('h4');
    // chessground calls movable.events.after in a timeout
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(board.state.pieces.get('h4')?.role).toBe('king');
    expect(boardApi.getHistory()).toHaveLength(0);
  });

  it('emits check after an undo while viewing history', () => {
    boardApi.move('e4');
    boardApi.move('f6');
    boardApi.move('Qh5');
    boardApi.move('g6');
    boardApi.viewStart();
    boardApi.undoLastMove();
    expect(wrapper.emitted('check')).toHaveLength(2);
    boardApi.stopViewingHistory();
    expect(wrapper.emitted('check')).toHaveLength(2);
  });

  it('keeps custom dests when the castling options change', () => {
    boardApi.setPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const board = (boardApi as any).board;
    boardApi.setConfig({ movable: { dests: new Map([['e1', ['g1']]]) } });

    boardApi.setConfig({ autoCastle: false });
    expect([...board.state.movable.dests]).toEqual([['e1', ['g1']]]);
    boardApi.setConfig({ autoCastle: true });
    expect([...board.state.movable.dests]).toEqual([['e1', ['g1', 'h1']]]);
  });

  it('does not castle a king dropped onto its rook in free mode with autoCastle disabled', async () => {
    boardApi.setConfig({ autoCastle: false, movable: { free: true } });
    boardApi.setPosition('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const board = (boardApi as any).board;

    board.selectSquare('e1');
    board.selectSquare('h1');
    // chessground calls movable.events.after in a timeout
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(board.state.pieces.get('h1')?.role).toBe('king');
    expect(boardApi.getHistory()).toHaveLength(0);
    expect(wrapper.emitted('move') ?? []).toHaveLength(0);
  });

  it('keeps the viewed position after an en passant capture', async () => {
    boardApi.setPosition(
      'rnbqkbnr/pppppppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
    boardApi.move('d5');
    boardApi.move('exd6');
    boardApi.viewPrevious();
    const viewedFen = (boardApi as any).board.getFen();

    // wait for the position update after the capture animation
    const { duration } = (boardApi as any).board.state.animation;
    await new Promise((resolve) => setTimeout(resolve, duration + 50));
    expect((boardApi as any).board.getFen()).toBe(viewedFen);
  });

  it.each(['loadPgn', 'setPosition', 'clearBoard'] as const)(
    'restores viewOnly when %s replaces the game while viewing history',
    (method) => {
      boardApi.move('e4');
      boardApi.move('e5');
      boardApi.viewStart();
      if (method === 'loadPgn') boardApi.loadPgn('1. d4 d5');
      else if (method === 'setPosition') boardApi.setPosition(initialPos);
      else boardApi.clearBoard();

      expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
        false
      );
      expect((boardApi as any).board.state.viewOnly).toBe(false);
    }
  );

  it('keeps a viewOnly board viewOnly when setPosition replaces the game while viewing history', () => {
    boardApi.setConfig({ viewOnly: true });
    boardApi.move('e4');
    boardApi.viewStart();
    boardApi.setPosition(initialPos);
    expect((boardApi as any).board.state.viewOnly).toBe(true);
  });

  it('applies viewOnly from setConfig with a fen while viewing history', () => {
    boardApi.move('e4');
    boardApi.viewStart();
    boardApi.setConfig({ fen: initialPos, viewOnly: true });
    expect((boardApi as any).boardState.historyViewerState.isEnabled).toBe(
      false
    );
    expect((boardApi as any).board.state.viewOnly).toBe(true);
  });

  it('resets viewOnly to its default with resetBoard while viewing history', () => {
    boardApi.setConfig({ viewOnly: true });
    boardApi.move('e4');
    boardApi.viewStart();
    boardApi.resetBoard();
    expect((boardApi as any).board.state.viewOnly).toBe(false);
  });

  describe('removing pieces', () => {
    const renderedKeys = () =>
      wrapper
        .findAll('cg-board piece')
        .map((piece) => (piece.element as any).cgKey);
    const nextFrame = () =>
      new Promise((resolve) => requestAnimationFrame(resolve));

    it('removes the piece from the game and the rendered board', async () => {
      boardApi.setConfig({ animation: { enabled: false } });
      await nextFrame();
      expect(renderedKeys()).toContain('e2');

      boardApi.removePiece('e2');
      await nextFrame();
      expect(renderedKeys()).not.toContain('e2');
      expect(boardApi.getSquare('e2')).toBeNull();
      expect((boardApi as any).board.state.movable.dests.has('e2')).toBe(false);
    });

    it('removes the piece from the rendered board in free mode', async () => {
      boardApi.setConfig({
        animation: { enabled: false },
        movable: { free: true },
      });
      boardApi.removePiece('d1');
      await nextFrame();
      expect(renderedKeys()).not.toContain('d1');
      expect((boardApi as any).board.state.pieces.has('d1')).toBe(false);
    });
  });

  it('returns whether a free move moved a piece', () => {
    boardApi.setConfig({ movable: { free: true } });
    // illegal in chess, the queen jumps over the d2 pawn
    expect(boardApi.move({ from: 'd1', to: 'd5' })).toBe(true);
    expect((boardApi as any).board.state.pieces.get('d5')?.role).toBe('queen');
    // d4 is empty
    expect(boardApi.move({ from: 'd4', to: 'd6' })).toBe(false);
  });

  it('adds a pgn header and checks if it is added', () => {
    boardApi.setPgnInfo({
      White: 'Deep Blue',
      Black: 'Kasparov',
      Date: '1997.05.11',
    });
    expect(boardApi.getPgn()).toContain('[White "Deep Blue"]');
    expect(boardApi.getPgn()).toContain('[Black "Kasparov"]');
    expect(boardApi.getPgn()).toContain('[Date "1997.05.11"]');
    expect(boardApi.getPgnInfo()).toEqual({
      White: 'Deep Blue',
      Black: 'Kasparov',
      Date: '1997.05.11',
    });
  });
});

export {};
