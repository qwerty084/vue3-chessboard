<script setup lang="ts">
import { ref, onMounted, toRef, defineAsyncComponent, watch } from 'vue';
import { Chess, type Move, type Square } from 'chess.js';
import { Chessground } from 'chessground';
import { BoardApi } from '@/classes/BoardApi';
import {
  toColor,
  possibleMoves,
  isPromotion,
  countThreats,
} from '@/helper/Board';
import { defaultBordConfig } from '@/helper/DefaultConfig';
import { useBordStateStore } from '@/stores/BoardStateStore';
import { initialPos } from '@/helper/DefaultConfig';
import { getThreats, calculatePromotions } from '@/helper/Board';
import '@/assets/board.css';
import type { Api } from 'chessground/api';
import type {
  Promotion,
  ThreatCount,
  SquareKey,
  PieceColor,
  drawType,
} from '@/typings/Chessboard';
import type { Key, MoveMetadata } from 'chessground/types';
import type { BoardConfig } from '@/typings/BoardConfig';

const props = defineProps({
  boardConfig: {
    type: Object as () => BoardConfig,
    default: defaultBordConfig,
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
const boardConfig = toRef(props, 'boardConfig');
const boardElement = ref<HTMLElement | null>(null);
const boardStore = useBordStateStore();
const game = new Chess();

const isCheckmate = ref(false);
const isStalemate = ref(false);
const isDraw = ref(false);
const inCheck = ref(false);
const showThreats = ref(false);
const selectedPromotion = ref<Promotion>();

let board: Api | undefined;
let promotions: Move[] = [];
let promoteTo: Promotion = 'q';

onMounted(() => {
  loadPosition();
  if (board) {
    emit('boardCreated', new BoardApi(game, board, boardStore));
  }
  if (props.boardConfig) {
    boardStore.boardConfig = { ...defaultBordConfig, ...props.boardConfig };
  } else {
    boardStore.boardConfig = defaultBordConfig;
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
    promotions = calculatePromotions(game, promotions);
    afterMove();
  };
}

function afterMove() {
  if (typeof board === 'undefined') return;
  if (showThreats.value) {
    board?.setShapes(getThreats(game));
  }
  const threats: ThreatCount =
    countThreats(toColor(game), boardConfig.value.fen ?? initialPos, game) ||
    {};
  threats['history'] = game.history();
  threats['fen'] = game.fen();

  if (game.in_checkmate()) {
    isCheckmate.value = true;
    emit('checkmate', board.state.turnColor);
  }
  if (game.in_stalemate()) {
    isStalemate.value = true;
    emit('stalemate', true);
  }
  if (game.in_draw()) {
    isDraw.value = true;
    emit('draw', true, '50-move rule || material');
  }
  if (game.in_threefold_repetition()) {
    isDraw.value = true;
    emit('draw', true, 'Threefold repetition');
  }
  if (game.in_check()) {
    inCheck.value = true;
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
    board.setShapes(getThreats(game));
  }
}

function loadPosition() {
  if (boardConfig.value.fen) {
    game.load(boardConfig.value.fen);
  }
  if (boardElement.value === null) return;

  board = Chessground(boardElement.value, props.boardConfig);

  board.set({
    movable: { events: { after: changeTurn() } },
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
