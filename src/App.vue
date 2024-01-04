<script setup lang="ts">
import { TheChessboard, type BoardApi, type BoardConfig } from '@/index';

let boardAPI: BoardApi | undefined;

const boardConfig: BoardConfig = {
  coordinates: true,
  autoCastle: false,
};
const playerColor: 'white' | 'black' | 'both' | undefined = undefined;
</script>

<template>
  <TheChessboard
    :board-config="boardConfig"
    :player-color="playerColor"
    class="board"
    @board-created="(api) => (boardAPI = api)"
  />
</template>

<style>
body {
  background-color: #222;
}
@media (orientation: landscape) {
  .board {
    width: 90vh;
    margin-inline: auto;
    max-width: 700px;
  }
}
</style>
