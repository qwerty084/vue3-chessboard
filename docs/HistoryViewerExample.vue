<script setup lang="ts">
import { TheChessboard, type BoardApi } from '../dist/vue3-chessboard';

let boardAPI: BoardApi | undefined;

</script>

<template>
  <section class="sect">
    <button class="button" @click="boardAPI?.viewStart">Start</button>
    <button class="button" @click="boardAPI?.viewPrevious">Previous</button>
    <button class="button" @click="boardAPI?.viewNext">Next</button>
    <button class="button" @click="boardAPI?.stopViewingHistory">End</button>
  </section>
  <TheChessboard @board-created="(api) => (boardAPI = api)" />
</template>

<style scoped>
.sect {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  gap: 3%;
}
.button {
  border-radius: 4px;
  padding: 0 12px;
  letter-spacing: 0.8px;
  line-height: 36px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #333;
  transition: background-color 0.25s;
  cursor: pointer;
}
.dark .button {
  border: 1px solid #fff;
}
</style>
