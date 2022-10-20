import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import TheChessboard from '@/components/TheChessboard.vue';

export function mountComponent() {
  return mount(TheChessboard, {
    global: {
      plugins: [createPinia()],
    },
  });
}
