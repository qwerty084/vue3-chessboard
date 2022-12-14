import { expect, it, describe } from 'vitest';
import { mountComponent } from './helper/Helper';
import { initialPosChessJS } from '@/helper/DefaultConfig';
import type { BoardApi } from '@/classes/BoardApi';

describe.concurrent('Test the board API', () => {
  const wrapper = mountComponent();

  const event = wrapper.emitted<BoardApi[]>('boardCreated');
  const boardApi = event?.[0][0];

  if (typeof boardApi === 'undefined') {
    throw new Error('boardApi is undefined');
  }

  // get current state
  // const initialBoardConf = boardApi?.boardState.boardConfig;

  it('emits board api', () => {
    expect(boardApi).toBeTruthy();
  });

  it('resets the board', () => {
    boardApi?.resetBoard();

    // test chess.js
    expect(boardApi?.getFen()).toBe(initialPosChessJS);
    expect(boardApi?.getCurrentTurnNumber()).toBe(0);
  });

  // test the board api
  it('undoes moves', () => {
    boardApi?.move('e4');
    boardApi?.undoLastMove();

    expect(boardApi?.getTurnColor()).toBe('white');
    expect(boardApi?.getCurrentTurnNumber()).toBe(0);
    expect(boardApi?.getFen()).toBe(initialPosChessJS);
  });

  it('returns the current turn color', () => {
    boardApi.resetBoard();

    boardApi.move('e4');
    expect(boardApi?.getTurnColor()).toBe('black');
    boardApi.undoLastMove();
    expect(boardApi?.getTurnColor()).toBe('white');
    boardApi.move('e4');
    boardApi.move('e5');
    expect(boardApi?.getTurnColor()).toBe('white');
  });
});

export {};
