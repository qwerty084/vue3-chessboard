<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
import { Chess, type Move, type Square } from 'chess.js';
import { Chessground } from 'chessground/chessground';
import { BoardApi } from '@/classes/BoardApi';
import { Stockfish } from '@/classes/Stockfish';
import {
  toColor,
  possibleMoves,
  getThreats,
  isPromotion,
  getPossiblePromotions,
} from '@/helper/Board';
import {
  defaultBoardConfig,
  defaultStockfishOpts,
} from '@/helper/DefaultConfig';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import type {
  BoardConfig,
  BoardState,
  StockfishOpts,
  Promotion,
  SquareKey,
  PieceColor,
  drawType,
} from '@/typings/Chessboard';
import type { StockfishClass } from '@/typings/Stockfish';

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
  stockfishOptions: {
    type: Object as () => StockfishOpts,
    default: defaultStockfishOpts,
  },
});

const emit = defineEmits<{
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'checkmate', isMated: PieceColor): void;
  (e: 'stalemate', isStalemate: boolean): void;
  (e: 'draw', isDraw: boolean, type: drawType): void;
  (e: 'check', isInCheck: PieceColor): void;
}>();

const boardElement = ref<HTMLElement | null>(null);
const boardConfig = ref<BoardConfig>({});
const boardAPI = ref<BoardApi>();
const game = new Chess();
const stockfish = ref<StockfishClass>();
const selectedPromotion = ref<Promotion>();
const boardState = reactive<BoardState>({
  showThreats: false,
  activeGame: true,
  boardConfig: {},
  openPromotionDialog: false,
});
let board: Api;
let promotions: Move[] = [];

onMounted(() => {
  if (props.boardConfig) {
    boardState.boardConfig = { ...defaultBoardConfig, ...props.boardConfig };
  } else {
    boardState.boardConfig = defaultBoardConfig;
  }
  loadPosition();

  boardAPI.value = new BoardApi(game, board, boardState);
  if (props.stockfishOptions.enabled) {
    stockfish.value = new Stockfish(
      boardAPI.value,
      game,
      props.stockfishOptions
    );
    boardAPI.value = new BoardApi(game, board, boardState, stockfish.value);
  }
  emit('boardCreated', boardAPI.value);
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

  stockfish.value?.sendMove();
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
        board.setAutoShapes([]);
        stockfish.value?.postMessage('stop');
        props.afterMoveCb();
      },
      select() {
        props.onSelectCb();
      },
    },
  });
}
</script>

<template>
  <section
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
      <div ref="boardElement" class="cg-board-wrap"></div>
    </div>
  </section>
</template>

<style>
html {
  background-color: #333;
}
</style>
