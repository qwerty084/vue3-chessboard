<script setup>
import { ref } from 'vue';
import { TheChessboard } from '../dist/vue3-chessboard';

let boardAPI;
let boardAPI2;
let boardAPI3;
let boardAPI4;
let boardAPI5;
const move = ref();

const runningStalemate = ref(false);
const runningDraw = ref(false);
const checkMoves = ['e4', 'f5', 'Qh5'];
const mateMoves = ['e4', 'e5', 'Qh5', 'a6', 'Bc4', 'a5', 'Qxf7#'];
const staleMateMoves = ["e4","g6","Nc3","Bg7","h4","h5","d4","c6","Bc4","d5","exd5","b5","Bd3","b4","Ne4","cxd5","Ng5","Nc6","N1f3","Bg4","c3","Qa5","Bd2","Nh6","O-O","O-O","Re1","e6","Qc1","bxc3","bxc3","Bf5","Nh3","Bxd3","Bxh6","Rac8","Bxg7","Kxg7","Qg5","Be4","Nf4","Rh8","Re3","Qc7","Nd2","Bf5","Rae1","Ne7","Qg3","Bg4","Qh2","Nf5","Rd3","Nd6","Rde3","Bf5","Nxd5","exd5","Re7","Qc6","Qe5+","Kg8","Nf3","Ne4","Rxa7","Rh7","Qe7","Re8","Qa3","f6","Ra6","Qc8","Nd2","Rc7","Nxe4","Bxe4","Rxf6","Rxc3","Qd6","Qg4","Rxe4","Qxe4","Rxg6+","Kh7","Rh6+","Kg8","Qf6","Qe1+","Kh2","Qh1+","Kxh1","Re1+","Kh2","Rh1+","Kxh1","Rh3+","Kg1","Rh1+", "Kxh1"];
const drawMoves = ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "d4", "Nd6", "Bxc6", "dxc6", "dxe5", "Nf5", "Qxd8+", "Kxd8", "h3", "Ke8", "Nc3", "h5", "Bf4", "Be7", "Rad1", "Be6", "Ng5", "Rh6", "g3", "Bxg5", "Bxg5", "Rg6", "h4", "f6", "exf6", "gxf6", "Bf4", "Nxh4", "f3", "Rd8", "Kf2", "Rxd1", "Nxd1", "Nf5", "Rh1", "Bxa2", "Rxh5", "Be6", "g4", "Nd6", "Rh7", "Nf7", "Ne3", "Kd8", "Nf5", "c5", "Ng3", "Ne5", "Rh8+", "Rg8", "Bxe5", "fxe5", "Rh5", "Bxg4", "fxg4", "Rxg4", "Rxe5", "b6", "Ne4", "Rh4", "Ke2", "Rh6", "b3", "Kd7", "Kd2", "Kc6", "Nc3", "a6", "Re4", "Rh2+", "Kc1", "Rh1+", "Kb2", "Rh6", "Nd1", "Rg6", "Ne3", "Rh6", "Re7", "Rh2", "Re6+", "Kb7", "Kc3", "Rh4", "Kb2", "Rh2", "Nd5", "Rd2", "Nf6", "Rf2", "Kc3", "Rf4", "Ne4", "Rh4", "Nf2", "Rh2", "Rf6", "Rh7", "Nd3", "Rh3", "Kd2", "Rh2+", "Rf2", "Rh4", "c4", "Rh3", "Kc2", "Rh7", "Nb2", "Rh5", "Re2", "Rg5", "Nd1", "b5", "Nc3", "c6", "Ne4", "Rh5", "Nf6", "Rg5", "Re7+", "Kb6", "Nd7+", "Ka5", "Re4", "Rg2+", "Kc1", "Rg1+", "Kd2", "Rg2+", "Ke1", "bxc4", "Rxc4", "Rg3", "Nxc5", "Kb5", "Rc2", "a5", "Kf2", "Rh3", "Rc1", "Kb4", "Ke2", "Rc3", "Nd3+", "Kxb3", "Ra1", "Kc4", "Nf2", "Kb5", "Rb1+", "Kc4", "Ne4", "Ra3", "Nd2+", "Kd5","Rh1", "a4", "Rh5+", "Kd4", "Rh4+", "Kc5", "Kd1", "Kb5", "Kc2", "Rg3", "Ne4", "Rg2+", "Kd3", "a3", "Nc3+", "Kb6", "Ra4", "a2", "Nxa2", "Rg3+", "Kc2", "Rg2+", "Kb3", "Rg3+", "Nc3", "Rh3", "Rb4+", "Kc7", "Rg4", "Rh7", "Kc4", "Rf7", "Rg5", "Kb6", "Na4+", "Kc7", "Kc5", "Kd7", "Kb6", "Rf1", "Nc5+", "Ke7", "Kxc6", "Rd1", "Rg6", "Kf7", "Rh6", "Rg1", "Kd5", "Rg5+", "Kd4", "Rg6", "Rh1", "Rg2", "Ne4", "Ra2", "Rf1+", "Ke7", "Nc3", "Rh2", "Nd5+", "Kd6", "Rf6+", "Kd7", "Nf4", "Rh1", "Rg6", "Rd1+", "Nd3", "Ke7", "Ra6", "Kd7", "Ke4", "Ke7", "Rc6", "Kd7", "Rc1", "Rxc1", "Nxc1"];

const promotionMoves = ["e4", "e5", "f4", "exf4", "g3", "fxg3", "Qg4", "gxh2", "Qg5", "hxg1=Q"];
const promotionData = ref(null);
const boardConfig = {
  coordinates: false,
}

function emitDraw() {
  runningDraw.value = true;
  drawMoves.forEach((move, i) => {
    setTimeout(() => {
      if (move === 'Nxc1') {
        runningDraw.value = false;
      }
      boardAPI4?.move(move);
    }, i * 300);
  });
}

function emitStalemate() {
  runningStalemate.value = true;
  staleMateMoves.forEach((move, i) => {
    setTimeout(() => {
      if (move === 'Kxh1') {
        runningStalemate.value = false;
      }
      boardAPI3?.move(move);
    }, i * 300);
  });
}

function emitCheck() {
  checkMoves.forEach((move, i) => {
    setTimeout(() => {
      boardAPI?.move(move);
    }, i * 1000);
  });
}

function emitMate() {
  mateMoves.forEach((move, i) => {
    setTimeout(() => {
      boardAPI2?.move(move);
    }, i * 1000);
  });
}

function emitPromotion() {
  promotionMoves.forEach((move, i) => {
    setTimeout(() => {
      boardAPI5?.move(move);
    }, i * 1000);
  });
}

function handleCheck(isInCheck) {
  setTimeout(() => alert(`${isInCheck} is in Check`), 300);
}

function handleStalemate() {
  setTimeout(() => alert('Stalemate'), 300);
}

function handleCheckmate(isMated) {
  setTimeout(() => alert(`${isMated} is mated`), 300);
}

function handleDraw() {
  setTimeout(() => alert('Draw'), 300);
}
</script>

# Board Events

## Available Events

- `boardCreated` - emitted when the board is created and the boardAPI is available
- `checkmate` - emitted when one player is mated
- `stalemate` - emitted when the game ends in stalemate
- `draw` - emitted when the game ends in a draw
- `check` - emitted when one player is in check
- `promotion` - emitted when a pawn is promoted
- `move` - emitted when a move is made

Here you can see the vue.js defineEmits:

```ts
const emit = defineEmits<{
  (e: 'boardCreated', boardApi: BoardApi): void; // emits boardAPI
  (e: 'checkmate', isMated: PieceColor): void; // emits the color of the mated player
  (e: 'stalemate'): void; // just emits stalemate, the value is not interesting
  (e: 'draw'): void; // same for draw
  (e: 'check', isInCheck: PieceColor): void; // emits color who is in check
  (e: 'promotion', promotion: PromotionEvent): void; // emits information about the promotion
  (e: 'move', move: MoveEvent): void; // emits information about the move
}>();
```

## Listening for Events

In the following examples you will see an alert when an event was emitted. <br>
Hit the play button, to see the events in action.

### Check

::: code-group

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

:::

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
    :board-config=boardConfig
    @board-created="(api) => (boardAPI = api)"
    @check="handleCheck"
  />
</div>

## Move Event

You can listen of moves on the board and get information about the move

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleMove(move) {
  console.log(move);
}
</script>

<template>
  <TheChessboard @move="handleMove" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type MoveEvent } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleMove(move: MoveEvent) {
  console.log(move);
}
</script>

<template>
  <TheChessboard @move="handleMove" />
</template>
```

:::

<div class="chessboard">
  <TheChessboard
    :board-config=boardConfig
    @move="(m) => (move = m)"
  />
</div>
<div class="move-container">
  <p>Emitted values:</p>
  <pre>{{ move }}</pre>
</div>

## Checkmate

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheckmate(isMated) {
  alert(`${isMated} is mated`);
}
</script>

<template>
  <TheChessboard @checkmate="handleCheckmate" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type PieceColor } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheckmate(isMated: PieceColor) {
  alert(`${isMated} is mated`);
}
</script>

<template>
  <TheChessboard @checkmate="handleCheckmate" />
</template>
```

:::

<div class="flex">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="emitMate">
<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="boardAPI2.resetBoard()">
<path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
</svg>

</div>

<div class="chessboard">
  <TheChessboard
    :board-config=boardConfig
    @board-created="(api) => (boardAPI2 = api)"
    @checkmate="handleCheckmate"
  />
</div>

## Promotion

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handlePromotion(promotion) {
  console.log(promotion);
}
</script>

<template>
  <TheChessboard @promotion="handlePromotion" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type PromotionEvent } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handlePromotion(promotion: PromotionEvent) {
  console.log(promotion);
}
</script>

<template>
  <TheChessboard @promotion="handlePromotion" />
</template>
```

:::

<div class="flex">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="emitPromotion">
<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="boardAPI5.resetBoard()">
<path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
</svg>

</div>

<p>Promotion: {{ promotionData ?? '' }}</p>

<div class="chessboard">
  <TheChessboard
    :board-config=boardConfig
    @board-created="(api) => (boardAPI5 = api)"
    @promotion="(promotion) => (promotionData = promotion)"
  />
</div>

## Stalemate

::: code-group

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

:::

<div class="flex">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="emitStalemate">
<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
</svg>

<svg v-if="!runningStalemate" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="boardAPI3?.resetBoard()">
<path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
</svg>

</div>

<p>Alfonso Romero Holmes vs Boris Kantsler (2002)</p>

<div class="chessboard">
  <TheChessboard
    :board-config=boardConfig
    @board-created="(api) => (boardAPI3 = api)"
    @stalemate="handleStalemate"
  />
</div>

## Draw

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleDraw() {
  alert('Draw');
}
</script>

<template>
  <TheChessboard @draw="handleDraw" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleDraw() {
  alert('Draw');
}
</script>

<template>
  <TheChessboard @draw="handleDraw" />
</template>
```

:::

<div class="flex">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="emitDraw">
<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
</svg>

<svg v-if="!runningDraw" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" @click="boardAPI4?.resetBoard()">
<path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
</svg>

</div>

<p>Magnus Carlsen vs Viswanathan Anand (World Championship Match 2014)</p>

<div class="chessboard">
  <TheChessboard
    :board-config=boardConfig
    @board-created="(api) => (boardAPI4 = api)"
    @draw="handleDraw"
  />
</div>
