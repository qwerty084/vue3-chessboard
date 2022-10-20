import type { BoardConfig } from './BoardConfig';

export interface BoardState {
  boardConfig: BoardConfig;
  showThreats: boolean;
  activeGame: boolean;
}
