import { moveableSquaresWhite } from './Constants';
import type { Api } from '@/classes/Api';

export function randomMoveFirstMove(api: Api) {
  const randomSquare =
    moveableSquaresWhite[
      Math.floor(Math.random() * moveableSquaresWhite.length)
    ];
  api.move(randomSquare);
}
