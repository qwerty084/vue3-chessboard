# Quick start

## About

vue3-chessboard is a component library for vue 3 written in TypeScript, using the <a href="https://github.com/lichess-org/chessground">lichess chessground</a> and <a href="https://github.com/jhlywa/chess.js">chess.js</a> for the board logic.
<br>

## Installation

::: code-group

```bash [npm]
npm install vue3-chessboard
```

```bash [yarn]
yarn add vue3-chessboard
```

```bash [pnpm]
pnpm install vue3-chessboard
```

:::

## Import the component

In the following you will see the most basic setup to get started. <br>
Later you will be shown more advanced configurations and event listeners.
<br><br>
For each code example there is always a JavaScript and TypeScript version.
Just copy the code for your prefered language in a \*.vue file to get started. <br>

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
</script>

<template>
  <TheChessboard />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
</script>

<template>
  <TheChessboard />
</template>
```

:::

<br>
Now the chessboard should be visible and you will be able to make moves 🚀
