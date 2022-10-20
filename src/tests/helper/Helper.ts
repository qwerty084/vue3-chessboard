import { mount } from '@vue/test-utils';
import TheChessboard from '@/components/TheChessboard.vue';

export function mountComponent() {
  return mount(TheChessboard, {});
}
