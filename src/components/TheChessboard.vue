<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
import { Chess, type Square } from 'chess.js';
import { Chessground } from 'chessground/chessground';
import { BoardApi } from '@/classes/BoardApi';
import { possibleMoves, getThreats, isPromotion } from '@/helper/Board';
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
    type: Object as () => BoardConfig,
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
const boardConfig = ref<BoardConfig>({});
const game = new Chess();
const selectedPromotion = ref<Promotion>();
const boardState = reactive<BoardState>({
  showThreats: false,
  activeGame: true,
  boardConfig: {},
  openPromotionDialog: false,
});

onMounted(() => {
  if (props.boardConfig) {
    boardState.boardConfig = { ...defaultBoardConfig, ...props.boardConfig };
  } else {
    boardState.boardConfig = defaultBoardConfig;
  }

  if (boardElement.value == null) return;
  if (boardConfig.value.fen) {
    game.load(boardConfig.value.fen);
  }

  board = Chessground(boardElement.value, boardState.boardConfig);
  board.set({
    movable: { events: { after: changeTurn() }, dests: possibleMoves(game) },
  });

  emit('boardCreated', new BoardApi(game, board, boardState, emit));
});

async function onPromotion(): Promise<Promotion> {
  boardState.openPromotionDialog = true;
  return new Promise((resolve) => {
    watch(selectedPromotion, () => {
      resolve(selectedPromotion.value);
    });
  });
}

function changeTurn(): (orig: Key, dest: Key) => Promise<void> {
  return async (orig: Key, dest: Key) => {
    if (typeof board === 'undefined') {
      console.error('vue3-chessboard: No board element found');
      return;
    }
    if (isPromotion(dest, game.get(orig as Square))) {
      await onPromotion();
      boardState.openPromotionDialog = false;
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

    if (boardState.showThreats) {
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
          :turn-color="game.turn()"
          @promotion-selected="(piece) => (selectedPromotion = piece)"
        />
      </div>
      <div ref="boardElement"></div>
    </div>
  </section>
</template>
