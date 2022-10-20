import { test, expect } from 'vitest';
import { mountComponent } from './helper/Helper';
import TheChessboard from '@/components/TheChessboard.vue';
import type { BoardConfig } from '@/typings/BoardConfig';

test('mount component', async () => {
  expect(TheChessboard).toBeTruthy();
  mountComponent();
});

test('board is visible', async () => {
  const wrapper = mountComponent();
  expect(wrapper.find('cg-board').exists()).toBeTruthy();
  expect(wrapper.isVisible()).toBeTruthy();
});

test('board props', async () => {
  const wrapper = mountComponent();
  const props: BoardConfig = wrapper.props().boardConfig;

  // test orientation
  if (props.orientation === 'white') {
    expect(wrapper.find('.orientation-white').exists()).toBeTruthy();
  } else {
    expect(wrapper.find('.orientation-black').exists()).toBeTruthy();
  }

  // test coordinates
  expect(wrapper.find('coords').exists()).toBe(props.coordinates);
});

export {};
