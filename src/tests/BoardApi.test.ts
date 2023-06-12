import { expect, it, describe, beforeEach } from 'vitest';
import { makeStalemate, mountComponent, resetBoard } from './helper/Helper';
import { initialPos } from '@/helper/DefaultConfig';
import type { BoardApi } from '@/classes/BoardApi';

describe.concurrent('Test the board API', () => {
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
    expect(boardApi.getLastMove()).toStrictEqual({
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
    expect(boardApi.getLastMove()).toStrictEqual({
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
});

export {};
