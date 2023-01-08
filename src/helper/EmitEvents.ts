import type { Emit } from '@/typings/Chessboard';
import type { ChessInstance } from 'chess.js';
import type { Api } from 'chessground/api';

export function emitBoardEvents(game: ChessInstance, board: Api, emit: Emit) {
  if (game.in_check()) {
    const pieces = board.state.pieces;
    pieces.forEach((piece, key) => {
      if (piece.role === 'king' && piece.color === board?.state.turnColor) {
        board.state.check = key;
        emit('check', board.state.turnColor);
      }
    });
  }

  if (game.in_checkmate()) {
    emit('checkmate', board.state.turnColor);
  }

  if (game.in_draw()) {
    emit('draw', true);
  }

  if (game.in_stalemate()) {
    emit('stalemate', true);
  }
}
