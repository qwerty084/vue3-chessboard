import type BoardApi from '@/classes/BoardApi';
import { expect, it, describe } from 'vitest';
import { mountComponent } from './helper/Helper';

describe.concurrent('Test the board events', () => {
  const wrapper = mountComponent();
  const api = wrapper.emitted('boardCreated');
  const event = wrapper.emitted<BoardApi[]>('boardCreated');
  const boardApi = event?.[0][0];

  it('emits board api', () => {
    expect(api).toBeTruthy();
  });

  it('emits checkmate event', () => {
    boardApi?.makeMove('e2', 'e4');
    boardApi?.makeMove('e7', 'e5');
    boardApi?.makeMove('f1', 'c4');
    boardApi?.makeMove('b8', 'c6');
    boardApi?.makeMove('d1', 'h5');
    boardApi?.makeMove('g8', 'f6');
    boardApi?.makeMove('h5', 'f7');
    // check if event is emitted
    expect(wrapper.emitted('checkmate')).toBeTruthy();
  });

  it('emits check event', () => {
    boardApi?.makeMove('e2', 'e4');
    boardApi?.makeMove('e7', 'e5');
    boardApi?.makeMove('f1', 'c4');
    boardApi?.makeMove('f7', 'f6');
    boardApi?.makeMove('d1', 'h5');
    // check if event is emitted
    expect(wrapper.emitted('check')).toBeTruthy();
  });
});

export {};
