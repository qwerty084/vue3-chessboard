import type { Api } from '@/classes/Api';
import { initialPos } from '@/helper/DefaultConfig';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeStalemate, mountComponent, resetBoard } from './helper/Helper';

describe.concurrent('Test the board API', () => {
  const wrapper = mountComponent();
  const api = wrapper.emitted<Api[]>('boardCreated')?.[0][0];
  if (typeof api === 'undefined') {
    throw new Error('No board api emitted');
  }

  // reset the board and events after each test
  beforeEach(() => resetBoard(wrapper, api));

  it('emits board api', () => {
    expect(api).toBeTruthy();
  });

  it('resets the board', () => {
    expect(api?.getFen()).toBe(initialPos);
    expect(api?.getCurrentTurnNumber()).toBe(1);
    expect(api.getLastMove()).toBeUndefined();
    expect(api?.getHistory()).toHaveLength(0);
  });

  it('undoes moves', () => {
    api?.move('e4');
    api?.undoLastMove();

    expect(api?.getTurnColor()).toBe('white');
    expect(api?.getCurrentTurnNumber()).toBe(1);
    expect(api?.getFen()).toBe(initialPos);
    expect(api.getHistory()).toHaveLength(0);

    // @TODO test if event emitted after undo
  });

  it('returns the current turn color', () => {
    api.move('e4');
    expect(api?.getTurnColor()).toBe('black');
    api.undoLastMove();
    expect(api?.getTurnColor()).toBe('white');
    api.move('e4');
    api.move('e5');
    expect(api?.getTurnColor()).toBe('white');
    resetBoard(wrapper, api);
    expect(api.getTurnColor()).toBe('white');
  });

  it('returns the correct material count', () => {
    const initialMaterialCount = api.getMaterialCount();

    expect(initialMaterialCount.materialWhite).toBe(39);
    expect(initialMaterialCount.materialBlack).toBe(39);
    expect(initialMaterialCount.materialDiff).toBe(0);

    api.move('e2e4');
    api.move('d7d5');
    api.move('exd5');
    const materialCountAfterExchange = api.getMaterialCount();

    expect(materialCountAfterExchange.materialWhite).toBe(39);
    expect(materialCountAfterExchange.materialBlack).toBe(38);
    expect(materialCountAfterExchange.materialDiff).toBe(1);

    api.resetBoard();
    const materialCountAfterReset = api.getMaterialCount();

    expect(materialCountAfterReset.materialWhite).toBe(39);
    expect(materialCountAfterReset.materialBlack).toBe(39);
    expect(materialCountAfterReset.materialDiff).toBe(0);
  });

  it('returns the captured pieces', () => {
    expect(api.getCapturedPieces()).toEqual({ white: [], black: [] });
    api.move('e4');
    api.move('d5');
    api.move('exd5');
    expect(api.getCapturedPieces()).toEqual({ white: ['p'], black: [] });
    api.move('Qxd5');
    expect(api.getCapturedPieces()).toEqual({
      white: ['p'],
      black: ['p'],
    });
    api.move('c4');
    api.move('e6');
    api.move('cxd5');
    expect(api.getCapturedPieces()).toEqual({
      white: ['p', 'q'],
      black: ['p'],
    });
    api.move('exd5');
    expect(api.getCapturedPieces()).toEqual({
      white: ['p', 'q'],
      black: ['p', 'p'],
    });
    api.move('Bc4');
    api.move('dxc4');
    expect(api.getCapturedPieces()).toEqual({
      white: ['p', 'q'],
      black: ['p', 'p', 'b'],
    });
  });

  it('returns the current turn number', () => {
    api.move('e4');
    expect(api?.getCurrentTurnNumber()).toBe(1);
    api.undoLastMove();
    expect(api?.getCurrentTurnNumber()).toBe(1);
    api.move('e4');
    api.move('e5');
    expect(api?.getCurrentTurnNumber()).toBe(2);
    api.move('Nf3');
    api.move('Nc6');
    expect(api?.getCurrentTurnNumber()).toBe(3);
    api.resetBoard();
    expect(api.getCurrentTurnNumber()).toBe(1);
  });

  it('should make a move programatically', () => {
    api.move('e4');
    expect(api.getIsGameOver()).toBe(false);
    expect(api.getFen()).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
    expect(api.getTurnColor()).toBe('black');

    // test for events after move
    resetBoard(wrapper, api);

    // test checkmate
    api.move('e4');
    api.move('e5');
    api.move('Qh5');
    api.move('c5');
    api.move('Bc4');
    api.move('b5');
    api.move('Qxf7#');
    expect(api.getIsCheckmate()).toBe(true);
    expect(api.getIsGameOver()).toBe(true);
    expect(wrapper.emitted('checkmate')).toHaveLength(1);

    // test check
    resetBoard(wrapper, api);
    api.move('e4');
    api.move('e5');
    api.move('Nc3');
    api.move('f6');
    api.move('Qh5+');
    expect(api.getIsCheck()).toBe(true);
    expect(api.getIsGameOver()).toBe(false);
    expect(wrapper.emitted('check')).toHaveLength(1);

    // test draw
    resetBoard(wrapper, api);
    makeStalemate(api);
    expect(api.getIsStalemate()).toBe(true);
    expect(api.getIsGameOver()).toBe(true);
    expect(api.getIsDraw()).toBe(true);
    expect(wrapper.emitted('draw')).toHaveLength(1);
    expect(wrapper.emitted('stalemate')).toHaveLength(1);
  });

  it('should update board with pgn', () => {
    const pgn = '1. e4 e5';

    api.loadPgn(pgn);

    expect(api.getFen()).toBe(
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'
    );
    expect(api?.getPgn()).toBe(pgn);
    expect(api.getTurnColor()).toBe('white');
    expect(api.getCurrentTurnNumber()).toBe(2);
  });

  it('should return the last move', () => {
    expect(api.getLastMove()).toBe(undefined);
    api.move('e4');
    expect(api.getLastMove()).toStrictEqual({
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
    api.move('e5');
    expect(api.getLastMove()).toStrictEqual({
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
    api.resetBoard();
    expect(api.getLastMove()).toBe(undefined);
  });

  it('loads a fen correctly', () => {
    let fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    api.setPosition(fen);
    expect(api?.getFen()).toBe(fen);
    expect(api.getSquare('e4')).toStrictEqual({
      type: 'p',
      color: 'w',
    });
    expect(api.getTurnColor()).toBe('white');
    expect(api.getCurrentTurnNumber()).toBe(2);
    expect(api.move('d7')).toBeFalsy();

    // check for check event with fen
    resetBoard(wrapper, api);
    api.setPosition(
      'rnbqkbnr/pppp2pp/8/4pp1Q/4PP2/8/PPPP2PP/RNB1KBNR b KQkq - 1 3'
    );
    expect(api.getTurnColor()).toBe('black');
    expect(api.getCurrentTurnNumber()).toBe(3);
    expect(api.move('d7')).toBeFalsy();
    expect(wrapper.emitted('check')).toHaveLength(1);

    // check for draw event with fen
    resetBoard(wrapper, api);
    fen = '8/8/4k3/8/4K3/8/8/8 w - - 0 1';
    api.setPosition(fen);

    expect(api.getIsDraw()).toBeTruthy();
    expect(api.getIsGameOver()).toBeTruthy();
    expect(wrapper.emitted('draw')).toHaveLength(1);

    // check for checkmate event with fen
    resetBoard(wrapper, api);
    api.setPosition(
      'rnbqkbnr/p1p2Qpp/1p1p4/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4'
    );
    expect(api.getCurrentTurnNumber()).toBe(4);
    expect(api.getIsGameOver()).toBeTruthy();
    expect(api.getIsCheckmate()).toBeTruthy();
    expect(wrapper.emitted('checkmate')).toHaveLength(1);
    expect(api.move('c7c5')).toBeFalsy();
  });

  it('handles short castling correctly', () => {
    api.move('e4');
    api.move('e5');
    api.move('Bc4');
    api.move('Bc5');
    api.move('Nf3');
    api.move('Nf6');
    expect(api.move('O-O')).toBeTruthy();
  });

  it('handles long castling correctly', () => {
    api.move('e4');
    api.move('e5');
    api.move('Qe2');
    api.move('d6');
    api.move('Nc3');
    api.move('c6');
    api.move('d4');
    api.move('c5');
    api.move('Bd2');
    api.move('b6');
    expect(api.move('O-O-O')).toBeTruthy();
  });

  it('handles promotions correctly', () => {
    api.move('e4');
    api.move('e5');
    api.move('d4');
    api.move('exd4');
    api.move('c3');
    api.move('dxc3');
    api.move('Qd2');
    api.move('cxb2');
    api.move('Qd3');
    api.move('bxa1=Q');
    expect(wrapper.emitted('promotion')?.[0][0]).toStrictEqual({
      color: 'black',
      promotedTo: 'Q',
      sanMove: 'bxa1=Q',
    });
    expect(wrapper.emitted('promotion')).toHaveLength(1);
  });

  it('sets new config correctly ', () => {
    expect((api as any).board.state.movable?.events?.after).toBeTruthy();
    expect((api as any).board.state.animation.enabled).toBe(true);
    expect((api as any).board.state.animation.duration).toBe(300);
    expect((api as any).board.state.drawable.enabled).toBe(true);
    api.setConfig({
      movable: { events: { after: undefined } },
      animation: { enabled: false, duration: 200 },
      drawable: { visible: false },
    });
    // test patching of after when undefined
    expect((api as any).board.state.movable?.events?.after).toBeTruthy();
    expect((api as any).board.state.animation.enabled).toBe(false);
    expect((api as any).board.state.animation.duration).toBe(200);
    expect((api as any).board.state.animation.enabled).toBe(false);
    expect((api as any).board.state.drawable.enabled).toBe(true);
    expect((api as any).board.state.drawable.visible).toBe(false);
  });

  /**
   * History Viewer Tests:
   */
  it('views game history', () => {
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(false);
    api.move('e4');
    api.move('e5');
    api.move('d4');
    api.move('exd4');
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(false);
    api.viewHistory(1);
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(true);
    expect((api as any).boardState.historyViewerState.plyViewing).toBe(1);
    expect((api as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('views the previous move when not viewing history', () => {
    api.move('e4');
    api.move('e5');
    api.viewPrevious();
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(true);
    expect((api as any).boardState.historyViewerState.plyViewing).toBe(1);
    expect((api as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('views the previous move when already viewing history', () => {
    api.move('e4');
    api.move('e5');
    api.viewPrevious();
    api.viewPrevious();
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(true);
    expect((api as any).boardState.historyViewerState.plyViewing).toBe(0);
    expect((api as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
  });

  it('views the next move when viewing history', () => {
    api.move('e4');
    api.move('e5');
    api.viewHistory(0);
    api.viewNext();
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(true);
    expect((api as any).boardState.historyViewerState.plyViewing).toBe(1);
    expect((api as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('views the first turn', () => {
    api.move('e4');
    api.move('e5');
    api.viewStart();
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(true);
    expect((api as any).boardState.historyViewerState.plyViewing).toBe(0);
    expect((api as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
  });

  it('stops viewing history', () => {
    api.move('e4');
    api.viewHistory(0);
    api.stopViewingHistory();
    expect((api as any).boardState.historyViewerState.isEnabled).toBe(false);
    expect((api as any).board.state.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    );
  });

  it('enableds viewOnly when viewing history', () => {
    expect((api as any).board.state.viewOnly).toBe(false);
    api.move('e4');
    api.viewHistory(0);
    expect((api as any).board.state.viewOnly).toBe(true);
  });

  it('disableds viewOnly when stopping viewing history if it should be disabled', () => {
    expect((api as any).board.state.viewOnly).toBe(false);
    api.move('e4');
    api.viewHistory(0);
    api.stopViewingHistory();
    expect((api as any).board.state.viewOnly).toBe(false);
  });

  it('keeps viewOnly enabled when stopping viewing history if it should be enabled', () => {
    api.setConfig({ viewOnly: true });
    expect((api as any).board.state.viewOnly).toBe(true);
    api.move('e4');
    api.viewHistory(0);
    api.stopViewingHistory();
    expect((api as any).board.state.viewOnly).toBe(true);
  });

  it('keeps animation enabled if it should be enabled', () => {
    expect((api as any).board.state.animation.enabled).toBe(true);
    api.move('e4');
    api.move('e5');
    api.viewStart();
    expect((api as any).board.state.animation.enabled).toBe(true);
    api.stopViewingHistory();
    expect((api as any).board.state.animation.enabled).toBe(true);
  });

  it('adds a pgn header and checks if it is added', () => {
    api.setPgnInfo({
      White: 'Deep Blue',
      Black: 'Kasparov',
      Date: '1997.05.11',
    });
    expect(api.getPgn()).toContain('[White "Deep Blue"]');
    expect(api.getPgn()).toContain('[Black "Kasparov"]');
    expect(api.getPgn()).toContain('[Date "1997.05.11"]');
  });
});

export {};
