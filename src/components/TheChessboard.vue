<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, watch } from 'vue';
import { Chess, type Move, type Square } from 'chess.js';
import { Chessground } from 'chessground';
import { BoardApi } from '@/classes/BoardApi';
import {
  toColor,
  possibleMoves,
  getThreats,
  isPromotion,
  calculatePromotions,
} from '@/helper/Board';
import { useBordStateStore } from '@/stores/BoardStateStore';
import { defaultBoardConfig } from '@/helper/DefaultConfig';
import type { Api } from 'chessground/api';
import type { Key, MoveMetadata } from 'chessground/types';
import type { BoardConfig } from '@/typings/BoardConfig';
import type {
  Promotion,
  SquareKey,
  PieceColor,
  drawType,
} from '@/typings/Chessboard';

const props = defineProps({
  boardConfig: {
    type: Object as () => BoardConfig,
    default: defaultBoardConfig,
  },
  onSelectCb: {
    type: Function,
    default: () => 1,
  },
  afterMoveCb: {
    type: Function,
    default: () => 1,
  },
});

const emit = defineEmits<{
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'checkmate', isMated: PieceColor): void;
  (e: 'stalemate', isStalemate: boolean): void;
  (e: 'draw', isDraw: boolean, type: drawType): void;
  (e: 'check', isInCheck: PieceColor): void;
}>();

const PromotionDialog = defineAsyncComponent(
  () => import('./PromotionDialog.vue')
);
const showPromotionDialog = ref(false);
const boardElement = ref<HTMLElement | null>(null);
const boardStore = useBordStateStore();
const game = new Chess();
const selectedPromotion = ref<Promotion>();

let board: Api | undefined;
let promotions: Move[] = [];
let promoteTo: Promotion;

onMounted(() => {
  if (props.boardConfig) {
    boardStore.boardConfig = { ...defaultBoardConfig, ...props.boardConfig };
  } else {
    boardStore.boardConfig = defaultBoardConfig;
  }
  loadPosition();
  if (board) {
    emit('boardCreated', new BoardApi(game, board, boardStore));
  }
});

async function onPromotion(): Promise<Promotion> {
  showPromotionDialog.value = true;
  return new Promise((resolve) => {
    watch(selectedPromotion, () => {
      resolve(selectedPromotion.value);
    });
  });
}

function changeTurn() {
  return async (orig: Key, dest: Key, metadata: MoveMetadata) => {
    metadata.premove = false;
    if (isPromotion(orig as SquareKey, dest as SquareKey, promotions)) {
      promoteTo = await onPromotion();
      showPromotionDialog.value = false;
    }
    game.move({
      from: orig as SquareKey,
      to: dest as SquareKey,
      promotion: promoteTo,
    });
    board?.set({
      fen: game.fen(),
      turnColor: toColor(game),
      movable: {
        color: toColor(game),
        dests: possibleMoves(game),
      },
    });
    promotions = calculatePromotions(game.moves({ verbose: true }));
    afterMove();
  };
}

function afterMove() {
  if (typeof board === 'undefined') return;

  if (game.in_checkmate()) {
    emit('checkmate', board.state.turnColor);
  }
  if (game.in_stalemate()) {
    emit('stalemate', true);
  }
  if (game.in_draw()) {
    emit('draw', true, '50-move rule || material');
  }
  if (game.in_threefold_repetition()) {
    emit('draw', true, 'Threefold repetition');
  }
  if (game.in_check()) {
    const currentPos = game.board();
    let kingPos: Square | undefined;
    const color = board.state.turnColor.charAt(0);
    currentPos.forEach((rows) => {
      const pos = rows.find(
        (row) => row?.type === 'k' && row?.color === color
      )?.square;
      if (pos) {
        kingPos = pos;
      }
    });
    if (kingPos) {
      board.state.check = kingPos;
    }
    emit('check', board.state.turnColor);
  }

  if (boardStore.showThreats) {
    board.setShapes(getThreats(game.moves({ verbose: true })));
  }
}

function loadPosition() {
  if (boardElement.value == null) return;
  if (boardStore.boardConfig.fen) {
    game.load(boardStore.boardConfig.fen);
  }

  board = Chessground(boardElement.value, boardStore.boardConfig);
  board.set({
    movable: { events: { after: changeTurn() } },
    events: {
      move() {
        props.afterMoveCb();
      },
      select() {
        props.onSelectCb();
      },
    },
  });
  afterMove();
}
</script>

<template>
  <section
    id="main-wrap"
    aria-label="chessboard"
    class="main-wrap"
    :class="{ disabledBoard: showPromotionDialog }"
  >
    <div class="main-board">
      <div class="dialog-container">
        <PromotionDialog
          v-if="showPromotionDialog"
          :turn-color="game.turn()"
          @promotion-selected="(piece) => (selectedPromotion = piece)"
        />
      </div>
      <div ref="boardElement" class="cg-board-wrap">
        <div class="cg-board"></div>
      </div>
    </div>
  </section>
</template>
