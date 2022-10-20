import { expect, it, describe } from 'vitest';
import { mountComponent } from './helper/Helper';

describe.concurrent('Test the board events', () => {
  const wrapper = mountComponent();
  const api = wrapper.emitted('boardCreated');

  it('emits board api', () => {
    expect(api).toBeTruthy();
  });

  it('emits checkmate event', () => {
    // const checkmate = wrapper.emitted('checkmate');
    // expect(checkmate).toBeTruthy();
  });
});

export {};
