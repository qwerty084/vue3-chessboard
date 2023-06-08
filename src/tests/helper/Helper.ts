import { VueWrapper, mount } from '@vue/test-utils';
import TheChessboard from '@/components/TheChessboard.vue';
import type BoardApi from '@/classes/BoardApi';

export function makeStalemate(boardApi: BoardApi) {
  boardApi.resetBoard();
  boardApi.move('c4');
  boardApi.move('d5');
  boardApi.move('Qb3');
  boardApi.move('Bh3');
  boardApi.move('gxh3');
  boardApi.move('f5');
  boardApi.move('Qxb7');
  boardApi.move('Kf7');
  boardApi.move('Qxa7');
  boardApi.move('Kg6');
  boardApi.move('f3');
  boardApi.move('c5');
  boardApi.move('Qxe7');
  boardApi.move('Rxa2');
  boardApi.move('Kf2');
  boardApi.move('Rxb2');
  boardApi.move('Qxg7+');
  boardApi.move('Kh5');
  boardApi.move('Qxg8');
  boardApi.move('Rxb1');
  boardApi.move('Rxb1');
  boardApi.move('Kh4');
  boardApi.move('Qxh8');
  boardApi.move('h5');
  boardApi.move('Qh6');
  boardApi.move('Bxh6');
  boardApi.move('Rxb8');
  boardApi.move('Be3+');
  boardApi.move('dxe3');
  boardApi.move('Qxb8');
  boardApi.move('Kg2');
  boardApi.move('Qf4');
  boardApi.move('exf4');
  boardApi.move('d4');
  boardApi.move('Be3');
  boardApi.move('dxe3');
}

export function mountComponent() {
  return mount(TheChessboard);
}

export function resetBoard(wrapper: VueWrapper, boardApi: BoardApi) {
  boardApi.resetBoard();
  for (const [key, _] of Object.entries(wrapper.emitted())) {
    wrapper.emitted()[key] = [];
  }
}
