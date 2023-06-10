<script setup lang="ts">
import { ref, onMounted, watch, type PropType } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
import { Chess, type Square } from 'chess.js';
import { Chessground } from 'chessground/chessground';
import { BoardApi } from '@/classes/BoardApi';
import {
  possibleMoves,
  getThreats,
  isPromotion,
  shortToLongColor,
  deepMergeConfig,
} from '@/helper/Board';
import { defaultBoardConfig } from '@/helper/DefaultConfig';
import { emitBoardEvents } from '@/helper/EmitEvents';
import type { Api } from 'chessground/api';
import type { Key, MoveMetadata } from 'chessground/types';
import type { BoardConfig, MoveableColor } from '@/typings/BoardConfig';
import type {
  Promotion,
  SquareKey,
  PieceColor,
  BoardState,
  PromotionEvent,
  PromotedTo,
  MoveEvent,
} from '@/typings/Chessboard';

const props = defineProps({
  boardConfig: {
    type: Object as PropType<BoardConfig>,
    default: {} as BoardConfig,
  },
  playerColor: {
    type: [String, undefined] as PropType<MoveableColor>,
    default: null,
  },
});

const emit = defineEmits<{
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'checkmate', isMated: PieceColor): void;
  (e: 'stalemate'): void;
  (e: 'draw'): void;
  (e: 'check', isInCheck: PieceColor): void;
  (e: 'promotion', promotion: PromotionEvent): void;
  (e: 'move', move: MoveEvent): void;
}>();

let board: Api | undefined;
const boardElement = ref<HTMLElement | null>(null);
const game = new Chess();
const selectedPromotion = ref<Promotion>();
const boardState = ref<BoardState>({
  showThreats: false,
  boardConfig: defaultBoardConfig,
  openPromotionDialog: false,
  playerColor: props.playerColor,
});

onMounted(() => {
  if (boardElement.value == null) {
    throw new Error('vue3-chessboard: Failed to mount board.');
  }

  if (props.playerColor) {
    updateConfig({
      movable: {
        color: props.playerColor,
      },
    });
  }

  updateConfig(props.boardConfig);
  if (props.boardConfig.fen) game.load(props.boardConfig.fen);
  patchAfter();

  board = Chessground(boardElement.value, boardState.value.boardConfig);

  emit('boardCreated', new BoardApi(game, board, boardState.value, emit));
  emitBoardEvents(game, board, emit);
});

function patchAfter(): void {
  // If user provided a movable.events.after function themselves we patch changeTurn
  // to run before it, otherwise we just assign changeTurn to movable.events.after.
  // (Note: we want changeTurn to run before the user's function rather than after it
  // so that the boardAPI can provide correct data, such as getLastMove() for the san.)
  if (boardState.value.boardConfig.movable?.events?.after) {
    const func = boardState.value.boardConfig.movable.events.after;
    boardState.value.boardConfig.movable.events.after = (
      ...args
    ): Promise<void> => changeTurn(...args).then(() => func(...args));
  } else {
    updateConfig({ movable: { events: { after: changeTurn } } });
  }
}

function updateConfig(config: BoardConfig): void {
  boardState.value.boardConfig = deepMergeConfig(
    boardState.value.boardConfig,
    config
  );
}

async function onPromotion(): Promise<Promotion> {
  boardState.value.openPromotionDialog = true;
  return new Promise((resolve) =>
    watch(selectedPromotion, () => resolve(selectedPromotion.value))
  );
}

async function changeTurn(
  orig: Key,
  dest: Key,
  _metadata: MoveMetadata
): Promise<void> {
  if (typeof board === 'undefined') {
    console.error('vue3-chessboard: No board element found');
    return;
  }
  if (isPromotion(dest, game.get(orig as Square))) {
    await onPromotion();
    boardState.value.openPromotionDialog = false;
    const promotedTo = selectedPromotion.value?.toUpperCase() as PromotedTo;

    emit('promotion', {
      color: board.state.turnColor,
      sanMove: `${orig[0]}x${dest}=${promotedTo}`,
      promotedTo,
    });
  }

  // TODO: catch exception thrown by invalid move and handle it based on boardConfig.movable.free value
  game.move({
    from: orig as SquareKey,
    to: dest as SquareKey,
    promotion: selectedPromotion.value,
  });
  selectedPromotion.value = undefined;

  // TODO: Consolidate this logic with similar logic in BoardAPI.move
  board.set({
    animation: {
      enabled: false,
    },
    fen: game.fen(),
    turnColor: board.state.turnColor,
    movable: {
      color: props.playerColor || board.state.turnColor,
      dests: possibleMoves(game),
      free:
        props.boardConfig?.movable?.free || defaultBoardConfig?.movable?.free,
    },
  });

  board.set({
    animation: {
      enabled: true,
    },
  });

  emitBoardEvents(game, board, emit);

  if (boardState.value.showThreats) {
    board.setShapes(getThreats(game.moves({ verbose: true })));
  }
}
</script>

<template>
  <section
    class="main-wrap"
    :class="{ disabledBoard: boardState.openPromotionDialog }"
  >
    <div class="main-board">
      <div class="dialog-container">
        <PromotionDialog
          v-if="boardState.openPromotionDialog"
          :turn-color="shortToLongColor(game.turn())"
          @promotion-selected="(piece: Promotion) => {selectedPromotion = piece}"
        />
      </div>
      <div ref="boardElement"></div>
    </div>
  </section>
</template>
