import type BoardApi from '@/classes/BoardApi';
import { expect, it, describe } from 'vitest';
import { mountComponent } from './helper/Helper';
import { moves } from './helper/Constants';

describe.concurrent('Test the board events', () => {
  const wrapper = mountComponent();
  const api = wrapper.emitted('boardCreated');
  const event = wrapper.emitted<BoardApi[]>('boardCreated');
  const boardApi = event?.[0][0];

  it('emits board api', () => {
    expect(api).toBeTruthy();
  });

  it('emits checkmate event', () => {
    boardApi?.resetBoard();
    wrapper.emitted()['checkmate'] = [];
    boardApi?.move('e4');
    boardApi?.move('e5');
    boardApi?.move('Bc4');
    boardApi?.move('c6');
    boardApi?.move('Qh5');
    boardApi?.move('b6');
    boardApi?.move('Qxf7');

    expect(wrapper.emitted('checkmate')).length(1);
  });

  it('emits check event', () => {
    boardApi?.resetBoard();
    wrapper.emitted()['check'] = [];
    boardApi?.move('e4');
    boardApi?.move('e5');
    boardApi?.move('Bc4');
    boardApi?.move('f6');
    boardApi?.move('Qh5');

    expect(wrapper.emitted('check')).length(1);
  });

  it('emits draw event', () => {
    boardApi?.resetBoard();
    wrapper.emitted()['draw'] = [];
    wrapper.emitted()['check'] = [];

    moves.forEach((move) => {
      boardApi?.move(move);
    });
    expect(wrapper.emitted('draw')).toBeTruthy();
    expect(wrapper.emitted('check')).toBeTruthy();
  });

  it('emits move event', () => {
    boardApi?.resetBoard();

    boardApi?.move('e4');
    expect(wrapper.emitted('move')).toBeTruthy();
  });
});

export {};
