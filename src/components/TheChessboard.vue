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
} from '@/helper/Board';
import { defaultBoardConfig } from '@/helper/DefaultConfig';
import { emitBoardEvents } from '@/helper/EmitEvents';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import type { BoardConfig } from '@/typings/BoardConfig';
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
    default: defaultBoardConfig,
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
const currentTurn = ref<PieceColor>('white');
const selectedPromotion = ref<Promotion>();
const boardState = ref<BoardState>({
  showThreats: false,
  boardConfig: {},
  openPromotionDialog: false,
});

onMounted(() => {
  if (boardElement.value == null) {
    throw new Error('vue3-chessboard: Failed to mount board.');
  }

  if (props.boardConfig) {
    boardState.value.boardConfig = {
      ...defaultBoardConfig,
      ...props.boardConfig,
    };
  } else {
    boardState.value.boardConfig = defaultBoardConfig;
  }

  if (props.boardConfig.fen) {
    game.load(props.boardConfig.fen);
    boardState.value.boardConfig.turnColor = shortToLongColor(game.turn());
    boardState.value.boardConfig.check = game.inCheck();
    boardState.value.boardConfig.movable = {
      color: boardState.value.boardConfig.turnColor,
      dests: possibleMoves(game),
    };
  }
  board = Chessground(boardElement.value, boardState.value.boardConfig);
  board.set({
    movable: { events: { after: changeTurn() }, dests: possibleMoves(game) },
  });

  currentTurn.value = shortToLongColor(game.turn());
  emit('boardCreated', new BoardApi(game, board, boardState.value, emit));
  emitBoardEvents(game, board, emit);
});

async function onPromotion(): Promise<Promotion> {
  currentTurn.value = shortToLongColor(game.turn());
  boardState.value.openPromotionDialog = true;
  return new Promise((resolve) =>
    watch(selectedPromotion, () => resolve(selectedPromotion.value))
  );
}

function changeTurn(): (orig: Key, dest: Key) => Promise<void> {
  return async (orig: Key, dest: Key) => {
    if (typeof board === 'undefined') {
      console.error('vue3-chessboard: No board element found');
      return;
    }
    if (isPromotion(dest, game.get(orig as Square))) {
      await onPromotion();
      boardState.value.openPromotionDialog = false;
      const promotedTo = selectedPromotion.value?.toUpperCase() as PromotedTo;
      const sanMove = `${orig[0]}x${dest}=${promotedTo}`;

      emit('promotion', {
        color: board.state.turnColor,
        sanMove,
        promotedTo: promotedTo,
      });
    }

    game.move({
      from: orig as SquareKey,
      to: dest as SquareKey,
      promotion: selectedPromotion.value,
    });
    selectedPromotion.value = undefined;

    board.set({
      animation: {
        enabled: false,
      },
      fen: game.fen(),
      turnColor: board.state.turnColor,
      movable: {
        color: board.state.turnColor,
        dests: possibleMoves(game),
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
  };
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
          :turn-color="currentTurn"
          @promotion-selected="(piece) => (selectedPromotion = piece)"
        />
      </div>
      <div ref="boardElement"></div>
    </div>
  </section>
</template>
