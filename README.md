# vue3-chessboard

Vue3 chessboard component built with:

- [lichess chessground](https://github.com/lichess-org/chessground)
- [chess.js](https://github.com/jhlywa/chess.js)
- [vue.js](https://github.com/vuejs/core)

Based on [vue-chessboard](https://github.com/vitogit/vue-chessboard) a Vue2 chessboard component.

![Chessboard](https://media.giphy.com/media/lotRUKBFZr5BmqVvLg/giphy.gif)

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)

# Features:

- Customizable chessboard
- Custom Events for check, checkmate, draw etc.
- Undo Moves, reset game, show threats/possible Moves
- Show material count
- Promotion dialog window
- Fully typed API/Custom Events

# Installation

```
npm i vue3-chessboard
```

# Usage

main.js / main.ts

```javascript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());

app.mount('#app');
```

Typescript Component

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Chessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import type { ChessboardAPI } from 'vue3-chessboard';

const boardAPI = ref<ChessboardAPI>();
const boardConfig = {
  coordinates: false,
  autoCastle: false,
};

function handleCheckmate(isMated: string) {
  if (isMated === 'w') {
    alert('Black wins!');
  } else {
    alert('White wins!');
  }
}

function toggleOrientation() {
  boardAPI.value?.board.toggleOrientation();
}

function resetBoard() {
  boardAPI.value?.resetBoard();
}
</script>

<template>
  <main>
    <section>
      <button @click="toggleOrientation">Toggle orientation</button>
      <button @click="resetBoard">Reset</button>
    </section>

    <Chessboard
      :board-config="boardConfig"
      @board-created="(api) => (boardAPI = api)"
      @checkmate="handleCheckmate"
    ></Chessboard>
  </main>
</template>
```

Javascript Component

```vue
<script setup>
import { ref } from 'vue';
import { Chessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardAPI = ref();
const boardConfig = {
  coordinates: false,
  autoCastle: false,
};

function handleCheckmate(isMated) {
  if (isMated === 'w') {
    alert('Black wins!');
  } else {
    alert('White wins!');
  }
}

function toggleOrientation() {
  boardAPI.value?.board.toggleOrientation();
}

function resetBoard() {
  boardAPI.value?.resetBoard();
}
</script>

<template>
  <main>
    <section>
      <button @click="toggleOrientation">Toggle orientation</button>
      <button @click="resetBoard">Reset</button>
    </section>

    <Chessboard
      :board-config="boardConfig"
      @board-created="(api) => (boardAPI = api)"
      @checkmate="handleCheckmate"
    ></Chessboard>
  </main>
</template>
```
