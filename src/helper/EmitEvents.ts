import type { Emit } from '@/typings/Chessboard';
import type { Chess } from 'chess.js';
import type { Api } from 'chessground/api';

export function emitBoardEvents(game: Chess, board: Api, emit: Emit): void {
  if (game.inCheck()) {
    const pieces = board.state.pieces;
    for (const [key, piece] of pieces) {
      if (piece.role === 'king' && piece.color === board?.state.turnColor) {
        board.state.check = key;
        emit('check', board.state.turnColor);
        if (game.isCheckmate()) {
          emit('checkmate', board.state.turnColor);
        }
        return;
      }
    }
  }

  if (game.isDraw()) {
    emit('draw', true);
  }

  if (game.isStalemate()) {
    emit('stalemate', true);
  }

  const lastMove = game.history({ verbose: true }).pop();
  if (typeof lastMove !== 'undefined') {
    emit('move', lastMove);
  }
}
