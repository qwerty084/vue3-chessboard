<script setup lang="ts">
import { ref } from 'vue';
import { TheChessboard, type ChessboardAPI, type BoardConfig } from '@/index';
import type { StockfishOpts } from './typings/Chessboard';
import '@/assets/board.css';

const boardAPI = ref<ChessboardAPI>();
const completedEval = ref(0);
const boardConfig: BoardConfig = {
  coordinates: false,
  autoCastle: false,
};
const stockfishOpts: StockfishOpts = {
  analysisMode: true,
  depth: 20,
  multiPV: 1,
  skillLevel: 20,
  enabled: true,
  limitStrength: false,
  ponder: false,
  useNNUE: false,
};

function handleMate() {
  alert('Checkmate!');
}

function handleStalemate() {
  alert('Stalemate!');
}

function handleDraw() {
  alert('Draw!');
}
</script>

<template>
  <main>
    <section role="region" aria-label="Board Controls">
      <button type="button" @click="boardAPI?.board.toggleOrientation()">
        Toggle orientation
      </button>
      <button type="button" @click="boardAPI?.resetBoard()">Reset</button>
      <button type="button" @click="boardAPI?.undoLastMove()">Undo</button>
      <button type="button" @click="boardAPI?.toggleThreats()">Threats</button>
      <div style="font-family: sans-serif; color: #fff">
        <progress
          :value="completedEval"
          max="100"
          aria-label="Evaluating progress"
        ></progress>
        <p>{{ boardAPI?.stockfish?.engineName }}</p>
      </div>
    </section>
    <TheChessboard
      :board-config="boardConfig"
      :stockfish-options="stockfishOpts"
      @board-created="(api) => (boardAPI = api)"
      @checkmate="handleMate"
      @stalemate="handleStalemate"
      @draw="handleDraw"
    />
  </main>
</template>

<style>
progress {
  background-color: green;
}

progress::-moz-progress-bar {
  background-color: green;
}
</style>
