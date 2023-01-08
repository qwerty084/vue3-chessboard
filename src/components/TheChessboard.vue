<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
import { Chess, type Square } from 'chess.js';
import { Chessground } from 'chessground/chessground';
import { BoardApi } from '@/classes/BoardApi';
import { possibleMoves, getThreats, isPromotion } from '@/helper/Board';
import { defaultBoardConfig } from '@/helper/DefaultConfig';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import type { BoardConfig } from '@/typings/BoardConfig';
import type { Promotion, SquareKey, PieceColor } from '@/typings/Chessboard';
import type { BoardState } from '@/typings/BoardState';
import { emitBoardEvents } from '@/helper/EmitEvents';

const props = defineProps({
  boardConfig: {
    type: Object as () => BoardConfig,
    default: defaultBoardConfig,
  },
});

const emit = defineEmits<{
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'checkmate', isMated: PieceColor): void;
  (e: 'stalemate', isStalemate: boolean): void;
  (e: 'draw', isDraw: boolean): void;
  (e: 'check', isInCheck: PieceColor): void;
}>();

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

let board: Api | undefined;

onMounted(() => {
  if (props.boardConfig) {
    boardState.boardConfig = { ...defaultBoardConfig, ...props.boardConfig };
  } else {
    boardState.boardConfig = defaultBoardConfig;
  }
  loadPosition();
  if (board) {
    emit('boardCreated', new BoardApi(game, board, boardState, emit));
  }
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
    if (isPromotion(dest, game.get(orig as Square))) {
      await onPromotion();
      boardState.openPromotionDialog = false;
    }

    game.move({
      from: orig as SquareKey,
      to: dest as SquareKey,
      promotion: selectedPromotion.value,
    });

    board?.set({
      fen: game.fen(),
      turnColor: board.state.turnColor,
      movable: {
        color: board.state.turnColor,
        dests: possibleMoves(game),
      },
    });

    afterMove();
    selectedPromotion.value = undefined;
  };
}

function afterMove(): void {
  if (typeof board === 'undefined') return;

  emitBoardEvents(game, board, emit);

  if (boardState.showThreats) {
    board.setShapes(getThreats(game.moves({ verbose: true })));
  }
}

function loadPosition(): void {
  if (boardElement.value == null) return;
  if (boardConfig.value.fen) {
    game.load(boardConfig.value.fen);
  }

  board = Chessground(boardElement.value, boardState.boardConfig);
  board.set({
    movable: { events: { after: changeTurn() } },
  });

  afterMove();
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
