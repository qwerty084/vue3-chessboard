import type { Api } from '@/classes/Api';
import { expect, it, describe, beforeEach } from 'vitest';
import { makeStalemate, mountComponent, resetBoard } from './helper/Helper';
import { moves } from './helper/Constants';

describe.concurrent('Test the board events', () => {
  const wrapper = mountComponent();
  const api = wrapper.emitted<Api[]>('boardCreated')?.[0][0];
  if (typeof api === 'undefined') {
    throw new Error('No Board Api emitted');
  }

  // reset the board and events after each test
  beforeEach(() => resetBoard(wrapper, api));

  it('emits checkmate event', () => {
    api.move('e4');
    api.move('e5');
    api.move('Bc4');
    api.move('c6');
    api.move('Qh5');
    api.move('b6');
    api.move('Qxf7');

    expect(wrapper.emitted('checkmate')).length(1);
  });

  it('emits check event', () => {
    api.move('e4');
    api.move('e5');
    api.move('Bc4');
    api.move('f6');
    api.move('Qh5');

    expect(wrapper.emitted('check')).length(1);
  });

  it('emits draw event', () => {
    moves.forEach((move) => {
      api.move(move);
    });
    expect(wrapper.emitted('draw')).toHaveLength(1);
    expect(wrapper.emitted('check')?.length).toBeGreaterThanOrEqual(1);
  });

  it('emits move event', () => {
    api.move('e4');
    expect(wrapper.emitted('move')).toHaveLength(1);
  });

  // stalemate
  it('emits stalemate event', () => {
    makeStalemate(api);
    expect(wrapper.emitted('stalemate')).toHaveLength(1);
  });

  // promotion
  it('emits promotion event', () => {
    api.move('e4');
    api.move('e5');
    api.move('d4');
    api.move('exd4');
    api.move('c3');
    api.move('dxc3');
    api.move('Qe2');
    api.move('cxb2');
    api.move('Bd2');
    api.move('bxa1=Q');
    expect(wrapper.emitted('promotion')).toHaveLength(1);
  });
});

export {};
