import { beforeEach, expect, it, describe } from 'vitest';
import TheChessboard from '@/components/TheChessboard.vue';
import { mount } from '@vue/test-utils';
import { resetBoard } from './helper/Helper';
import type BoardApi from '@/classes/BoardApi';

describe.concurrent('Test the board', () => {
  const wrapper = mount(TheChessboard, {
    props: {
      playerColor: 'white',
      boardConfig: {
        coordinates: false,
        movable: {
          free: false,
          events: {
            after: () => console.log('Test'),
          },
        },
        animation: {
          enabled: false,
          duration: 0,
        },
        drawable: {
          enabled: false,
          brushes: undefined,
        },
      },
    },
  });
  const boardApi = wrapper.emitted<BoardApi[]>('boardCreated')?.[0][0];
  if (typeof boardApi === 'undefined') {
    throw new Error('No board api emitted');
  }

  // reset the board and events after each test
  beforeEach(() => resetBoard(wrapper, boardApi));

  it('mounts the component', () => {
    expect(wrapper).toBeTruthy();
  });

  it('shows the board', () => {
    expect(wrapper.find('cg-board').exists()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
  });

  it('handles the boardconfig merging correctly', () => {
    expect(
      (boardApi as any).board.state.movable?.events?.after
    ).toBeTruthy();
    expect((boardApi as any).board.state.animation.enabled).toBe(
      false
    );
    expect((boardApi as any).board.state.animation.duration).toBe(0);
    expect(
      (boardApi as any).board.state.drawable.brushes
    ).toBeUndefined();
    expect((boardApi as any).board.state.drawable.enabled).toBe(
      false
    );
  });

  it('handles the player color correctly', async () => {
    expect(boardApi.move('e4')).toBeTruthy();
    expect((boardApi as any).board.state.turnColor).toBe('black');
    expect((boardApi as any).board.state.movable.color).toBe('white');
    expect(boardApi.move('e5')).toBeTruthy();
    expect((boardApi as any).board.state.turnColor).toBe('white');
    expect((boardApi as any).board.state.movable.color).toBe('white');
    expect(boardApi.move('d6')).toBeFalsy();
  });
});

export {};
