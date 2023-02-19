import { moveableSquaresWhite } from './Constants';
import type { BoardApi } from '@/classes/BoardApi';

export function randomMoveFirstMove(boardApi: BoardApi) {
  const randomSquare =
    moveableSquaresWhite[
      Math.floor(Math.random() * moveableSquaresWhite.length)
    ];
  boardApi?.move(randomSquare);
}
