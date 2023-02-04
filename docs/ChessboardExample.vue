<script setup lang="ts">
import { ref } from 'vue';
import { TheChessboard, type ChessboardAPI } from '../dist/vue3-chessboard';
import '../dist/style.css';

const boardAPI = ref<ChessboardAPI>();
const opening = ref('');
const boardConfig = {
  coordinates: false,
  autoCastle: false,
};

async function getOpening() {
  opening.value = await boardAPI.value?.getOpeningName();
}
</script>

<template>
  <div>
    <p>Opening: {{ opening }}</p>
  </div>
  <section class="sect">
    <button class="button" @click="boardAPI?.toggleOrientation()">
      Toggle orientation
    </button>
    <button class="button" @click="boardAPI?.resetBoard()">Reset</button>
    <button class="button" @click="boardAPI?.undoLastMove()">Undo</button>
    <button class="button" @click="boardAPI?.toggleMoves()">Threats</button>
    <button class="button" @click="getOpening">Opening</button>
  </section>
  <TheChessboard
    :board-config="boardConfig"
    @board-created="(api) => (boardAPI = api)"
  />
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
