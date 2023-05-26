import type { Emit } from '@/typings/Chessboard';
import type { Chess } from 'chess.js';
import type { Api } from 'chessground/api';

export function emitBoardEvents(game: Chess, board: Api, emit: Emit): void {
  const lastMove = game.history({ verbose: true }).pop();
  if (typeof lastMove !== 'undefined') {
    emit('move', lastMove);
  }

  if (game.inCheck()) {
    const pieces = board.state.pieces;
    for (const [key, piece] of pieces) {
      if (piece.role === 'king' && piece.color === board?.state.turnColor) {
        board.state.check = key;
        if (game.isCheckmate()) {
          emit('checkmate', board.state.turnColor);
        } else {
          emit('check', board.state.turnColor);
        }
      }
    }
  }

  if (game.isDraw()) {
    emit('draw');
  }

  if (game.isStalemate()) {
    emit('stalemate');
  }
}
