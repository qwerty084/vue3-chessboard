import { defaultBordConfig } from '@/helper/DefaultConfig';
import { defineStore } from 'pinia';
import type { BoardState } from '@/typings/BoardStore';

export const useBordStateStore = defineStore({
  id: 'boardStateStore',
  state: (): BoardState => {
    return {
      activeGame: false,
      boardConfig: defaultBordConfig,
      showThreats: false,
    };
  },
});
