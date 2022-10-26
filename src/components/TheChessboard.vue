<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
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
  enableStockfish: {
    type: Boolean,
    default: false,
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
const stockfish = ref<Worker>();
const selectedPromotion = ref<Promotion>();
const boardState = reactive<BoardState>({
  showThreats: false,
  activeGame: true,
  boardConfig: {},
  openPromotionDialog: false,
});

const moveArr = ref<string[]>([]);

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
    boardAPI.value = new BoardApi(game, board, boardState);
    emit('boardCreated', boardAPI.value);
  }

  if (props.enableStockfish) {
    const wasmSupported =
      typeof WebAssembly === 'object' &&
      WebAssembly.validate(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );

    if (wasmSupported) {
      stockfish.value = new Worker(
        new URL('stockfish.wasm.js', import.meta.url)
      );
    } else {
      stockfish.value = new Worker(new URL('./stockfish.js', import.meta.url), {
        type: 'module',
      });
    }

    stockfish.value.addEventListener('message', function (e) {
      if (e.data.includes('Unknown command')) {
        console.error('UNKNOWN COMMAND', e.data);
      }
      console.log(e.data);
      const data: string = e.data;
      if (data.includes('bestmove')) {
        const move = data.split(' ')[1];
        const from = move.substring(0, 2) as SquareKey;
        const to = move.substring(2, 4) as SquareKey;
        boardAPI.value?.showBestMove(from, to);
      }
    });

    stockfish.value.postMessage('uci');
    stockfish.value.postMessage('ucinewgame');
    stockfish.value.postMessage('position startpos');
    stockfish.value.postMessage('go depth 20');
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

  const lastMove = game.history({ verbose: true }).at(-1);

  if (!lastMove?.from || !lastMove?.to) return;

  moveArr.value.push(`${lastMove.from}${lastMove.to}`);
  stockfish.value?.postMessage(
    `position startpos moves ${moveArr.value.join(' ')}`
  );
  stockfish.value?.postMessage('go depth 15');
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
