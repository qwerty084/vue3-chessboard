import { moveableSquaresWhite } from './Constants';
import type { BoardAPI } from '@/typings/BoardAPI';

export function randomMoveFirstMove(boardApi: BoardAPI) {
  const randomSquare =
    moveableSquaresWhite[
      Math.floor(Math.random() * moveableSquaresWhite.length)
    ];
  boardApi?.move(randomSquare);
}
