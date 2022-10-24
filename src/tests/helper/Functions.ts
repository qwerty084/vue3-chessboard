import { possibleMoves } from '@/helper/Board';
import { moveableSquaresWhite } from './Constants';
import type { BoardAPI } from '@/typings/BoardAPI';
import type { SquareKey } from '@/typings/Chessboard';

export function randomMoveFirstMove(boardApi: BoardAPI) {
  const moves = possibleMoves(boardApi.game);
  const randomSquare =
    moveableSquaresWhite[
      Math.floor(Math.random() * moveableSquaresWhite.length)
    ];
  const random = Math.floor(Math.random() * 2);
  const move = moves.get(randomSquare)?.[random] as SquareKey;
  if (!move) {
    console.warn('Random move is undefined');
    return;
  }
  boardApi?.makeMove(randomSquare, move);
}
