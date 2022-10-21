<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, watch, reactive } from 'vue';
import { Chess, type Move, type Square } from 'chess.js';
import { Chessground } from 'chessground/chessground';
import { BoardApi } from '@/classes/BoardApi';
import {
  toColor,
  possibleMoves,
  getThreats,
  isPromotion,
  getPossiblePromotions,
} from '@/helper/Board';

import { defaultBoardConfig } from '@/helper/DefaultConfig';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import type { BoardConfig } from '@/typings/BoardConfig';
import type {
  Promotion,
  SquareKey,
  PieceColor,
  drawType,
} from '@/typings/Chessboard';
import type { BoardState } from '@/typings/BoardState';

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
let promotions: Move[] = [];

onMounted(() => {
  if (props.boardConfig) {
    boardState.boardConfig = { ...defaultBoardConfig, ...props.boardConfig };
  } else {
    boardState.boardConfig = defaultBoardConfig;
  }
  loadPosition();
  if (board) {
    emit('boardCreated', new BoardApi(game, board, boardState));
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

function changeTurn() {
  return async (orig: Key, dest: Key) => {
    if (isPromotion(orig as SquareKey, dest as SquareKey, promotions)) {
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
      turnColor: toColor(game),
      movable: {
        color: toColor(game),
        dests: possibleMoves(game),
      },
    });
    promotions = getPossiblePromotions(game.moves({ verbose: true }));
    afterMove();

    selectedPromotion.value = undefined;
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

  if (boardState.showThreats) {
    board.setShapes(getThreats(game.moves({ verbose: true })));
  }
}

function loadPosition() {
  if (boardElement.value == null) return;
  if (boardConfig.value.fen) {
    game.load(boardConfig.value.fen);
  }

  board = Chessground(boardElement.value, boardState.boardConfig);
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
      <div ref="boardElement" class="cg-board-wrap">
        <div class="cg-board"></div>
      </div>
    </div>
  </section>
</template>
