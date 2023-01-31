# vue3-chessboard

![Tests](https://github.com/qwerty084/vue3-chessboard/workflows/Tests/badge.svg)

Vue3 chessboard component built with:

- [lichess chessground](https://github.com/lichess-org/chessground)
- [chess.js](https://github.com/jhlywa/chess.js)
- [vue.js](https://github.com/vuejs/core)

Based on [vue-chessboard](https://github.com/vitogit/vue-chessboard) a Vue2 chessboard component.

![Chessboard](https://media3.giphy.com/media/cWw6eHQ7AmjDXbWm6w/giphy.gif?cid=790b7611cce1bb251c4ae6a786ea4dc8be97b1563f59d989&rid=giphy.gif&ct=g)

You can find the demo and documentation [here](https://qwerty084.github.io/vue3-chessboard/).

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Docs](#docs)

# Features:

- Customizable chessboard
- Custom Events for check, checkmate, draw etc.
- Undo Moves, reset game, show threats/possible Moves, get opening name
- Show material count
- Promotion dialog window
- Fully typed API/Custom Events

# Installation

```
npm i vue3-chessboard
```

# Usage

Example Typescript Component

```html
<script setup lang="ts">
import { ref } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import type { ChessboardAPI, BoardConfig } from 'vue3-chessboard';

const boardAPI = ref<ChessboardAPI>();
const boardConfig: BoardConfig = {
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
</script>

<template>
  <main>
    <section role="region" aria-label="Board Controls">
      <button type="button" @click="boardAPI?.board.toggleOrientation()">
        Toggle orientation
      </button>
      <button type="button" @click="boardAPI?.resetBoard()">Reset</button>
      <button type="button" @click="boardAPI?.undoLastMove()">Undo</button>
      <button type="button" @click="boardAPI?.toggleThreats()">Threats</button>
    </section>
    <TheChessboard
      :board-config="boardConfig"
      @board-created="(api) => (boardAPI = api)"
      @checkmate="handleCheckmate"
    />
  </main>
</template>
```

Example Javascript Component

```html
<script setup>
import { ref } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
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
    <section role="region" aria-label="Board Controls">
      <button type="button" @click="boardAPI?.board.toggleOrientation()">
        Toggle orientation
      </button>
      <button type="button" @click="boardAPI?.resetBoard()">Reset</button>
      <button type="button" @click="boardAPI?.undoLastMove()">Undo</button>
      <button type="button" @click="boardAPI?.toggleThreats()">Threats</button>
    </section>
    <TheChessboard
      :board-config="boardConfig"
      @board-created="(api) => (boardAPI = api)"
      @checkmate="handleCheckmate"
    />
  </main>
</template>
```

# Docs
You can find the full documentation [here](https://qwerty084.github.io/vue3-chessboard/)

## Setup:

- Just install the package and import the component in your project, like shown above.
- Dont forget to include the stylesheet: <br>
  `import 'vue3-chessboard/style.css';`

<br>

### Chessboard config

You can pass a config object to the chessboard component to modify the board to your needs, as a prop (:board-config). The config object is optional and will be merged with the [default config](https://github.com/qwerty084/vue3-chessboard/blob/main/src/helper/DefaultConfig.ts).
The default config is based on the [lichess board config](https://github.com/lichess-org/chessground/blob/master/src/state.ts).
Additionally custom callback functions can be passed to the component.
For example a custom function can be run on piece selection or after each move.

<br>

### Chessboard API

The chessboard component provides a class based API to interact with the chessboard. The API is accessible via the board-created event. The event will be emitted when the chessboard is created and the API is ready to use.

#### Available methods:

- resetBoard() - Resets the board to the initial position
- undoLastMove() - Undo the last move
- getMaterialCount() - Returns the material count of both sides
- showThreats() - Shows all possible moves/threats
- hideThreats() - Hides all possible moves/threats
- toggleThreats() - Toggles possible moves/threats
- getOpeningName() - Get the opening name for the current position from lichess api
- getOpeningDescription() - Get description of current position from wikibooks.org
- makeMove() - Make a move programmatically on the board

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
  (e: 'draw', isDraw: boolean): void;
  (e: 'check', isInCheck: PieceColor): void;
}>();
```

