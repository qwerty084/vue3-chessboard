import type BoardApi from '@/classes/BoardApi';
import { expect, it, describe, beforeEach } from 'vitest';
import { makeStalemate, mountComponent, resetBoard } from './helper/Helper';
import { moves } from './helper/Constants';

describe.concurrent('Test the board events', () => {
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
