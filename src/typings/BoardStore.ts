import type { BoardConfig } from './BoardConfig';

export interface BoardState {
  activeGame: boolean;
  boardConfig: BoardConfig;
  showThreats: boolean;
}
