<script setup lang="ts">
import { ref } from 'vue';
import { TheChessboard, type ChessboardAPI, type BoardConfig } from '@/index';
import '@/assets/board.css';

const boardAPI = ref<ChessboardAPI>();
const boardConfig: BoardConfig = {
  coordinates: false,
  autoCastle: false,
};
</script>

<template>
  <main>
    <section role="region" aria-label="Board Controls">
      <button type="button" @click="boardAPI?.board.toggleOrientation()">
        Toggle orientation
      </button>
      <button type="button" @click="boardAPI?.resetBoard()">Reset</button>
      <button type="button" @click="boardAPI?.undoLastMove()">Undo</button>
      <button type="button" @click="boardAPI?.showThreats()">Threats</button>
    </section>
    <TheChessboard
      :board-config="boardConfig"
      :enable-stockfish="true"
      @board-created="(api) => (boardAPI = api)"
    />
  </main>
</template>
