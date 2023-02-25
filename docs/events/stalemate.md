<script setup>
import { ref } from 'vue';
import { TheChessboard } from '../../dist/vue3-chessboard';

const runningStalemate = ref(false);
const boardAPI = ref();
const staleMateMoves = [
  'e3',
  'a5',
  'Qh5',
  'Ra6',
  'Qxa5',
  'h5',
  'Qxc7',
  'Rah6',
  'h4',
  'f6',
  'Qxd7+',
  'Kf7',
  'Qxb7',
  'Qd3',
  'Qxb8',
  'Qh7',
  'Qxc8',
  'Kg6',
  'Qe6',
];

function loopMoves(arr, i) {
  if (i === arr.length) {
    runningStalemate.value = false;
    return;
  }
  boardAPI.value?.move(arr[i]);
  setTimeout(loopMoves, 1000, arr, i + 1);
}

function emitStalemate() {
  runningStalemate.value = true;
  loopMoves(staleMateMoves, 0);
}

function handleStalemate() {
  setTimeout(() => alert('Stalemate'), 300);
}
</script>

# Stalemate

<br>

Emitted when the game ends in stalemate.

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleStalemate() {
  alert('Stalemate');
}
</script>

<template>
  <TheChessboard @stalemate="handleStalemate" />
</template>
```

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleStalemate() {
  alert('Stalemate');
}
</script>

<template>
  <TheChessboard @stalemate="handleStalemate" />
</template>
```

<div class="flex">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="emitStalemate">
<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
</svg>

<svg v-if="!runningStalemate" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="boardAPI3?.resetBoard()">
<path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
</svg>

</div>

<p>Source: <a href="https://en.wikipedia.org/wiki/List_of_world_records_in_chess">Fastest Stalemate</a></p>

<div class="chessboard">
  <TheChessboard
    @board-created="(api) => (boardAPI = api)"
    @stalemate="handleStalemate"
  />
</div>
