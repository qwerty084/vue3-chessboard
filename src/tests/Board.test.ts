import { beforeEach, expect, it, describe } from 'vitest';
import TheChessboard from '@/components/TheChessboard.vue';
import { mount } from '@vue/test-utils';
import { resetBoard } from './helper/Helper';
import type { Api } from '@/classes/Api';
import { reactive } from 'vue';
import type { BoardConfig } from '@/typings/BoardConfig';

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
  const api = wrapper.emitted<Api[]>('boardCreated')?.[0][0];
  if (typeof api === 'undefined') {
    throw new Error('No board api emitted');
  }

  // reset the board and events after each test
  beforeEach(() => resetBoard(wrapper, api));

  it('mounts the component', () => {
    expect(wrapper).toBeTruthy();
  });

  it('shows the board', () => {
    expect(wrapper.find('cg-board').exists()).toBeTruthy();
    expect(wrapper.isVisible()).toBeTruthy();
  });

  it('handles the boardconfig merging correctly', () => {
    expect((api as any).board.state.movable?.events?.after).toBeTruthy();
    expect((api as any).board.state.animation.enabled).toBe(false);
    expect((api as any).board.state.animation.duration).toBe(0);
    expect((api as any).board.state.drawable.brushes).toBeUndefined();
    expect((api as any).board.state.drawable.enabled).toBe(false);
  });

  it('handles the player color correctly', () => {
    expect(api.move('e4')).toBeTruthy();
    expect((api as any).board.state.turnColor).toBe('black');
    expect((api as any).board.state.movable.color).toBe('white');
    expect(api.move('e5')).toBeTruthy();
    expect((api as any).board.state.turnColor).toBe('white');
    expect((api as any).board.state.movable.color).toBe('white');
    expect(api.move('d6')).toBeFalsy();
  });
});

describe('Test reactiveConfig prop option', () => {
  let config: BoardConfig;
  let wrapper;
  let api: Api | undefined;

  beforeEach(() => {
    config = reactive({
      coordinates: false,
      animation: {
        enabled: false,
        duration: 100,
      },
    });
    wrapper = mount(TheChessboard, {
      props: { boardConfig: config, reactiveConfig: true },
    });
    api = wrapper.emitted<Api[]>('boardCreated')?.[0][0];
  });

  it('updates existing config options', async () => {
    expect((api as any).board.state.coordinates).toBe(false);
    // need to wrap config update in an async function to await so that config watcher
    // has time to update the config by the time we test board.state in next line
    await (async () => {
      config.coordinates = true;
    })();
    expect((api as any).board.state.coordinates).toBe(true);
  });

  it('updates new config options', async () => {
    expect((api as any).board.state.coordinates).toBe(false);
    expect((api as any).board.state.viewOnly).toBe(false);
    await (async () => {
      config.viewOnly = true;
    })();
    expect((api as any).board.state.viewOnly).toBe(true);
    expect((api as any).board.state.coordinates).toBe(false);
  });

  it('updates nested config options', async () => {
    expect((api as any).board.state.animation.enabled).toBe(false);
    expect((api as any).board.state.animation.duration).toBe(100);
    await (async () => {
      config.animation!.enabled = true;
    })();
    expect((api as any).board.state.animation.enabled).toBe(true);
    expect((api as any).board.state.animation.duration).toBe(100);
  });
});

export {};
