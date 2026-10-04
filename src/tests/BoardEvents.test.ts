import type BoardApi from '@/classes/BoardApi';
import { expect, it, describe, beforeEach } from 'vitest';
import { makeStalemate, mountComponent, resetBoard } from './helper/Helper';
import { moves } from './helper/Constants';

describe('Test the board events', () => {
  const wrapper = mountComponent();
  const boardApi = wrapper.emitted<BoardApi[]>('boardCreated')?.[0][0];
  if (typeof boardApi === 'undefined') {
    throw new Error('No Board Api emitted');
  }

  // reset the board and events after each test
  beforeEach(() => resetBoard(wrapper, boardApi));

  it('emits checkmate event', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('Bc4');
    boardApi.move('c6');
    boardApi.move('Qh5');
    boardApi.move('b6');
    boardApi.move('Qxf7');

    expect(wrapper.emitted('checkmate')).length(1);
  });

  it('emits check event', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('Bc4');
    boardApi.move('f6');
    boardApi.move('Qh5');

    expect(wrapper.emitted('check')).length(1);
  });

  it('emits draw event', () => {
    moves.forEach((move) => {
      boardApi.move(move);
    });
    expect(wrapper.emitted('draw')).toHaveLength(1);
    expect(wrapper.emitted('check')?.length).toBeGreaterThanOrEqual(1);
  });

  it('emits draw event once on threefold repetition', () => {
    ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'].forEach((move) =>
      boardApi.move(move)
    );
    expect(wrapper.emitted('draw')).toHaveLength(1);

    // e4 leaves the repeated position, so no further draw event fires
    boardApi.move('e4');
    expect(wrapper.emitted('draw')).toHaveLength(1);
  });

  describe('emits draw event on threefold repetition of the starting position', () => {
    const repeat = (): void =>
      ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'].forEach((move) =>
        boardApi.move(move)
      );
    // fen() drops the e6 en passant square, because no white pawn can capture on e6
    const epFen =
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';

    it('after removePiece', () => {
      boardApi.removePiece('a2');
      repeat();
      expect(wrapper.emitted('draw')).toHaveLength(1);
    });

    it('after putPiece', () => {
      boardApi.putPiece({ type: 'q', color: 'w' }, 'd4');
      repeat();
      expect(wrapper.emitted('draw')).toHaveLength(1);
    });

    it('after setPosition with an en passant square', () => {
      boardApi.setPosition(epFen);
      repeat();
      expect(wrapper.emitted('draw')).toHaveLength(1);
    });

    it('after loadPgn with an en passant square', () => {
      boardApi.loadPgn(`[SetUp "1"]\n[FEN "${epFen}"]\n\n*`);
      repeat();
      expect(wrapper.emitted('draw')).toHaveLength(1);
    });
  });

  it('emits move event', () => {
    boardApi.move('e4');
    expect(wrapper.emitted('move')).toHaveLength(1);
  });

  // stalemate
  it('emits stalemate event', () => {
    makeStalemate(boardApi);
    expect(wrapper.emitted('stalemate')).toHaveLength(1);
  });

  // promotion
  it('emits promotion event', () => {
    boardApi.move('e4');
    boardApi.move('e5');
    boardApi.move('d4');
    boardApi.move('exd4');
    boardApi.move('c3');
    boardApi.move('dxc3');
    boardApi.move('Qe2');
    boardApi.move('cxb2');
    boardApi.move('Bd2');
    boardApi.move('bxa1=Q');
    expect(wrapper.emitted('promotion')).toHaveLength(1);
  });
});

export {};
