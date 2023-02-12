import type BoardApi from '@/classes/BoardApi';
import { expect, it, describe } from 'vitest';
import { mountComponent } from './helper/Helper';

const moves = [
  'e4',
  'c5',
  'Nf3',
  'd6',
  'd4',
  'cxd4',
  'Nxd4',
  'Nf6',
  'Nc3',
  'a6',
  'Bg5',
  'e6',
  'f4',
  'Qb6',
  'Nb3',
  'Nc6',
  'Bxf6',
  'gxf6',
  'Qd2',
  'Bd7',
  'O-O-O',
  'Qc7',
  'Kb1',
  'b5',
  'Bxb5',
  'axb5',
  'Nxb5',
  'Qb8',
  'Nxd6+',
  'Bxd6',
  'Qxd6',
  'Qxd6',
  'Rxd6',
  'Ke7',
  'Rhd1',
  'Rhd8',
  'Nc5',
  'Be8',
  'Rxd8',
  'Nxd8',
  'g3',
  'Bc6',
  'e5',
  'fxe5',
  'fxe5',
  'Bd5',
  'b3',
  'Ra5',
  'b4',
  'Ra3',
  'b5',
  'Rc3',
  'Na4',
  'Rc4',
  'Nb2',
  'Rc5',
  'Rd4',
  'Bg2',
  'a4',
  'Rxe5',
  'Rb4',
  'Nb7',
  'Nc4',
  'Re4',
  'c3',
  'Nd6',
  'Nd2',
  'Rxb4+',
  'cxb4',
  'Ne4',
  'Kc2',
  'Nxd2',
  'Kxd2',
  'Kd6',
  'Ke3',
  'Kd5',
  'Kd3',
  'Bf1+',
  'Kd2',
  'Kd6',
  'Kc2',
  'Kd5',
  'Kd2',
  'Kd6',
  'Kc2',
  'Kd5',
  'Kd2',
];

describe.concurrent('Test the board events', () => {
  const wrapper = mountComponent();
  const api = wrapper.emitted('boardCreated');
  const event = wrapper.emitted<BoardApi[]>('boardCreated');
  const boardApi = event?.[0][0];

  it('emits board api', () => {
    expect(api).toBeTruthy();
  });

  it('emits checkmate event', () => {
    boardApi?.resetBoard();
    wrapper.emitted()['checkmate'] = [];
    boardApi?.move('e4');
    boardApi?.move('e5');
    boardApi?.move('Bc4');
    boardApi?.move('c6');
    boardApi?.move('Qh5');
    boardApi?.move('b6');
    boardApi?.move('Qxf7');

    expect(wrapper.emitted('checkmate')).length(1);
  });

  it('emits check event', () => {
    boardApi?.resetBoard();
    wrapper.emitted()['check'] = [];
    boardApi?.move('e4');
    boardApi?.move('e5');
    boardApi?.move('Bc4');
    boardApi?.move('f6');
    boardApi?.move('Qh5');

    expect(wrapper.emitted('check')).length(1);
  });

  it('emits draw event', () => {
    boardApi?.resetBoard();
    wrapper.emitted()['draw'] = [];
    wrapper.emitted()['check'] = [];

    moves.forEach((move) => {
      boardApi?.move(move);
    });
    expect(wrapper.emitted('draw')).toBeTruthy();
    expect(wrapper.emitted('check')).toBeTruthy();
  });

  it('emits move event', () => {
    boardApi?.resetBoard();

    boardApi?.move('e4');
    expect(wrapper.emitted('move')).toBeTruthy();
  });
});

export {};
