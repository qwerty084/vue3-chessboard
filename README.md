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
- [Docs](#docs)

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

Example Typescript Component

```html
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

Example Javascript Component

```html
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

# Docs

### Setup:

- Make sure you have pinia installed and included in main.js/ts
- Include the style sheet: <br>
  `import 'vue3-chessboard/style.css';`

<br>

### Chessboard config

You can pass a config object to the chessboard component as a prop (:board-config). The config object is optional and will be merged with the [default config](https://github.com/qwerty084/vue3-chessboard/blob/main/src/helper/DefaultConfig.ts).
The default config is based on the [lichess board config](https://github.com/lichess-org/chessground/blob/master/src/state.ts).

<br>

### Chessboard API

The chessboard component provides a class based API to interact with the chessboard. The API is accessible via the board-created event. The event will be emitted when the chessboard is created and the API is ready to use.

#### Available methods:

- resetBoard() - Resets the board to the initial position
- undoMove() - Undoes the last move
- getMaterialCount() - Returns the material count of both sides
- showThreats() - Shows all possible moves/threats
- hideThreats() - Hides all possible moves/threats
- toggleThreats() - Toggles possible moves/threats

Additionally the chessground & chess.js instances are available via the board property.
You can find the available methods for the chessground instance [here](https://github.com/lichess-org/chessground/blob/master/src/api.ts) and the available methods for the chess.js instance [here](https://github.com/jhlywa/chess.js/blob/master/README.md).

<br>

### Custom Events

You can listen for events on the chessboard component. The following events are available:

- boardCreated - Emitted when the chessboard is created and the API is ready to use
- checkmate - Emitted when a player is checkmated
- stalemate - Emitted when a player is stalemated
- draw - Emitted when the game is drawn
- check - Emitted when a player is checked

```Typescript
const emit = defineEmits<{
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'checkmate', isMated: PieceColor): void;
  (e: 'stalemate', isStalemate: boolean): void;
  (e: 'draw', isDraw: boolean, type: drawType): void;
  (e: 'check', isInCheck: PieceColor): void;
}>();
```
