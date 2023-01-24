<script setup lang="ts">
import { ref } from 'vue';
import { TheChessboard, type ChessboardAPI, type BoardConfig } from '@/index';
import '@/assets/board.css';
const boardAPI = ref<ChessboardAPI>();

const boardConfig: BoardConfig = {
  coordinates: true,
  autoCastle: false,
};
</script>

<template>
  <TheChessboard
    :board-config="boardConfig"
    @board-created="(api) => (boardAPI = api)"
  />
</template>

<style>
body {
  background-color: #222;
}
</style>
