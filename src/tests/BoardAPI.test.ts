import { expect, it, describe } from 'vitest';
import { mountComponent } from './helper/Helper';
import { initialPos, initialPosChessJS } from '@/helper/DefaultConfig';
import type { BoardApi } from '@/classes/BoardApi';
import { read } from 'chessground/fen';

describe.concurrent('Test the board API', () => {
  const wrapper = mountComponent();

  const event = wrapper.emitted<BoardApi[]>('boardCreated');
  const boardApi = event?.[0][0];

  // get current state
  const initialBoardConf = boardApi?.state.boardConfig;

  it('emits board api', () => {
    expect(boardApi).toBeTruthy();
  });

  it('has a game instance', () => {
    expect(boardApi?.game).toBeTruthy();
  });

  it('has a board instance', () => {
    expect(boardApi?.board).toBeTruthy();
  });

  it('has a state instance', () => {
    expect(boardApi?.state).toBeTruthy();
  });

  it('resets the board', () => {
    boardApi?.resetBoard();

    // test chess.js
    expect(boardApi?.game.fen()).toBe(initialPosChessJS);
    expect(boardApi?.state.boardConfig).toEqual(initialBoardConf);
    expect(boardApi?.game.history().length).toBe(0);
    expect(boardApi?.game.validate_fen(boardApi?.game.fen()).valid).toBe(true);
    expect(boardApi?.game.in_check()).toBe(false);
    expect(boardApi?.game.in_checkmate()).toBe(false);
    expect(boardApi?.game.in_draw()).toBe(false);
    expect(boardApi?.game.in_stalemate()).toBe(false);
    expect(boardApi?.game.in_threefold_repetition()).toBe(false);
    expect(boardApi?.game.insufficient_material()).toBe(false);
    expect(boardApi?.game.game_over()).toBe(false);

    // test chessground
    expect(boardApi?.board.state.pieces).toEqual(read(initialPosChessJS));
    expect(boardApi?.board.state.lastMove).toBeUndefined();
    expect(boardApi?.board.state.selected).toBeUndefined();
    expect(boardApi?.board.state.check).toBeUndefined();

    // test chessground & chess.js
    expect(boardApi?.board.getFen()).toBe(initialPos);
    if (boardApi?.state.boardConfig.turnColor === 'white') {
      expect(boardApi?.game.turn()).toBe('w');
      expect(boardApi.board.state.turnColor).toBe('white');
      expect(boardApi?.board.state.movable.color).toBe('white');
    } else {
      expect(boardApi?.game.turn()).toBe('b');
      expect(boardApi?.board.state.turnColor).toBe('black');
      expect(boardApi?.board.state.movable.color).toBe('black');
    }
    expect(boardApi?.board.state.movable.color).toBe(
      boardApi?.board.state.turnColor
    );
  });
});

export {};
