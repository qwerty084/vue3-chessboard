<script setup>
import { ref } from 'vue';
import { TheChessboard } from '../../dist/vue3-chessboard';

const boardAPI = ref(null);
const checkMoves = ['e4', 'f5', 'Qh5'];

function handleCheck(isInCheck) {
  setTimeout(() => alert(`${isInCheck} is in Check`), 400);
}

function emitCheck() {
  checkMoves.forEach((move, i) => {
    setTimeout(() => {
      boardAPI?.value.move(move);
    }, i * 1000);
  });
}
</script>

# Check

<br>

Emitted when a player is in check. In the event the color of the player who is in check is included.

Definition:

```ts
defineEmits<{
  (e: 'check', isInCheck: PieceColor): void;
}>();

export type PieceColor = 'white' | 'black';
```

Example:
::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type PieceColor } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheck(isInCheck: PieceColor) {
  alert(`${isInCheck} is in Check`);
}
</script>

<template>
  <TheChessboard @check="handleCheck" />
</template>
```

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheck(isInCheck) {
  alert(`${isInCheck} is in Check`);
}
</script>

<template>
  <TheChessboard @check="handleCheck" />
</template>
```

:::

<br>

<div class="flex">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="emitCheck">
<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="boardAPI.resetBoard()">
<path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
</svg>

</div>

<div class="chessboard">
  <TheChessboard
    @board-created="(api) => (boardAPI = api)"
    @check="handleCheck"
  />
</div>
