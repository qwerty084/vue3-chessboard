import type { Emit } from '@/typings/Chessboard';
import type { Chess } from 'chess.js';
import type { Api } from 'chessground/api';

export function emitBoardEvents(game: Chess, board: Api, emit: Emit) {
  if (game.inCheck()) {
    const pieces = board.state.pieces;
    pieces.forEach((piece, key) => {
      if (piece.role === 'king' && piece.color === board?.state.turnColor) {
        board.state.check = key;
        emit('check', board.state.turnColor);
      }
    });
  }

  if (game.isCheckmate()) {
    emit('checkmate', board.state.turnColor);
  }

  if (game.isDraw()) {
    emit('draw', true);
  }

  if (game.isStalemate()) {
    emit('stalemate', true);
  }

  emit('move', game.history({ verbose: true }).at(-1));
}
