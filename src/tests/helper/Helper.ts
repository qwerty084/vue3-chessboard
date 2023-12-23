import { VueWrapper, mount } from '@vue/test-utils';
import TheChessboard from '@/components/TheChessboard.vue';
import type { Api } from '@/classes/Api';

export function makeStalemate(api: Api) {
  api.resetBoard();
  api.move('c4');
  api.move('d5');
  api.move('Qb3');
  api.move('Bh3');
  api.move('gxh3');
  api.move('f5');
  api.move('Qxb7');
  api.move('Kf7');
  api.move('Qxa7');
  api.move('Kg6');
  api.move('f3');
  api.move('c5');
  api.move('Qxe7');
  api.move('Rxa2');
  api.move('Kf2');
  api.move('Rxb2');
  api.move('Qxg7+');
  api.move('Kh5');
  api.move('Qxg8');
  api.move('Rxb1');
  api.move('Rxb1');
  api.move('Kh4');
  api.move('Qxh8');
  api.move('h5');
  api.move('Qh6');
  api.move('Bxh6');
  api.move('Rxb8');
  api.move('Be3+');
  api.move('dxe3');
  api.move('Qxb8');
  api.move('Kg2');
  api.move('Qf4');
  api.move('exf4');
  api.move('d4');
  api.move('Be3');
  api.move('dxe3');
}

export function mountComponent() {
  return mount(TheChessboard);
}

export function resetBoard(wrapper: VueWrapper, api: Api) {
  api.resetBoard();
  for (const [key, _] of Object.entries(wrapper.emitted())) {
    wrapper.emitted()[key] = [];
  }
}
