import { beforeEach, expect, it, describe } from 'vitest';
import TheChessboard from '@/components/TheChessboard.vue';
import { mount } from '@vue/test-utils';
import { resetBoard } from './helper/Helper';
import type BoardApi from '@/classes/BoardApi';
import { reactive } from 'vue';
import type { BoardConfig } from '@/typings/BoardConfig';

describe('Test the board', () => {
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
    expect((boardApi as any).board.state.movable?.events?.after).toBeTruthy();
    expect((boardApi as any).board.state.animation.enabled).toBe(false);
    expect((boardApi as any).board.state.animation.duration).toBe(0);
    expect((boardApi as any).board.state.drawable.brushes).toBeUndefined();
    expect((boardApi as any).board.state.drawable.enabled).toBe(false);
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

describe('Test Map and element config values', () => {
  function mountWith(boardConfig: BoardConfig) {
    const wrapper = mount(TheChessboard, { props: { boardConfig } });
    return {
      wrapper,
      boardApi: wrapper.emitted<BoardApi[]>('boardCreated')?.[0][0] as BoardApi,
    };
  }

  it('mounts with movable.rookCastle disabled', () => {
    const { boardApi } = mountWith({ movable: { rookCastle: false } });
    expect((boardApi as any).board.state.movable.rookCastle).toBe(false);
    expect((boardApi as any).board.state.movable.dests).toBeInstanceOf(Map);
  });

  it('applies highlight.custom from the board config', async () => {
    const { wrapper } = mountWith({
      highlight: { custom: new Map([['e4', 'marked']]) },
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(wrapper.find('cg-board square.marked').exists()).toBe(true);
  });

  it('keeps premovable.customDests when filling defaults', () => {
    const { boardApi } = mountWith({});
    const customDests = new Map([['e7', ['e5']]]);
    boardApi.setConfig({ premovable: { customDests } }, true);
    const state = (boardApi as any).board.state;
    expect(state.premovable.customDests).toBeInstanceOf(Map);
    expect(state.premovable.customDests.get('e7')).toEqual(['e5']);
  });

  it('resets Map and callback options when filling defaults', () => {
    const { boardApi } = mountWith({});
    boardApi.setConfig({
      highlight: { custom: new Map([['e4', 'marked']]) },
      premovable: { customDests: new Map([['e7', ['e5']]]) },
      drawable: { onChange: () => {} },
    });
    boardApi.resetBoard();
    const state = (boardApi as any).board.state;
    expect(state.highlight.custom).toBeUndefined();
    expect(state.premovable.customDests).toBeUndefined();
    expect(state.drawable.onChange).toBeUndefined();
  });

  it('passes the addDimensionsCssVarsTo element through', () => {
    const element = document.createElement('div');
    const { boardApi } = mountWith({ addDimensionsCssVarsTo: element });
    expect((boardApi as any).board.state.addDimensionsCssVarsTo).toBe(element);
  });
});

describe('Test reactiveConfig prop option', () => {
  let config: BoardConfig;
  let wrapper;
  let boardApi: BoardApi;

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
    boardApi = wrapper.emitted<BoardApi[]>('boardCreated')?.[0][0] as BoardApi;
  });

  it('updates existing config options', async () => {
    expect((boardApi as any).board.state.coordinates).toBe(false);
    // need to wrap config update in an async function to await so that config watcher
    // has time to update the config by the time we test board.state in next line
    await (async () => {
      config.coordinates = true;
    })();
    expect((boardApi as any).board.state.coordinates).toBe(true);
  });

  it('updates new config options', async () => {
    expect((boardApi as any).board.state.coordinates).toBe(false);
    expect((boardApi as any).board.state.viewOnly).toBe(false);
    await (async () => {
      config.viewOnly = true;
    })();
    expect((boardApi as any).board.state.viewOnly).toBe(true);
    expect((boardApi as any).board.state.coordinates).toBe(false);
  });

  it('updates nested config options', async () => {
    expect((boardApi as any).board.state.animation.enabled).toBe(false);
    expect((boardApi as any).board.state.animation.duration).toBe(100);
    await (async () => {
      config.animation!.enabled = true;
    })();
    expect((boardApi as any).board.state.animation.enabled).toBe(true);
    expect((boardApi as any).board.state.animation.duration).toBe(100);
  });
});

export {};
