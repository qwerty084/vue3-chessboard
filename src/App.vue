<script setup lang="ts">
import '@/assets/styles.css';
import { TheChessboard, type Api, type BoardConfig } from '@/index';

let api: Api | undefined;

const boardConfig: BoardConfig = {
  coordinates: true,
  autoCastle: false,
};
const playerColor: 'white' | 'black' | 'both' | undefined = undefined;

function handleBoardCreated(newApi: Api): void {
  api = newApi;

  console.log(api);
}
</script>

<template>
  <TheChessboard
    :board-config="boardConfig"
    :player-color="playerColor"
    @board-created="handleBoardCreated"
  />
</template>

<style>
body {
  background-color: #222;
}
</style>
