# vue3-chessboard

[![Unit Tests](https://github.com/qwerty084/vue3-chessboard/actions/workflows/tests.yml/badge.svg)](https://github.com/qwerty084/vue3-chessboard/actions/workflows/tests.yml)
[![CodeQL](https://github.com/qwerty084/vue3-chessboard/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/qwerty084/vue3-chessboard/actions/workflows/codeql.yml)
[![npm](https://img.shields.io/npm/v/vue3-chessboard)](https://www.npmjs.com/package/vue3-chessboard)

vue3-chesssboard is a component library for vue 3 built with [lichess chessground](https://github.com/lichess-org/chessground) & [chess.js](https://github.com/jhlywa/chess.js).

![Chessboard](https://media3.giphy.com/media/cWw6eHQ7AmjDXbWm6w/giphy.gif?cid=790b7611cce1bb251c4ae6a786ea4dc8be97b1563f59d989&rid=giphy.gif&ct=g)

You can find a demo and the full library documentation [here](https://chessboard.lucahelms.dev).

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Docs](#docs)

# Features:

- Customizable chessboard
- Custom Events for check, checkmate, draw, move etc.
- Undo Moves, reset game, get opening name, get current fen...
- Promotion dialog window
- Fully typed API/Custom Events

# Installation

```
npm i vue3-chessboard
```

# Usage

Basic Example (Composition API)

```html
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
</script>

<template>
  <TheChessboard />
</template>
```

Basic Example (Options API)

```html
<template>
  <TheChessboard />
</template>

<script>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

export default {
  components: {
    TheChessboard,
  },
};
</script>
```

<hr>

Example Typescript Component

```html
<script setup lang="ts">
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import type { BoardApi, BoardConfig } from 'vue3-chessboard';

let boardAPI: BoardApi;
const boardConfig: BoardConfig = {
  coordinates: false,
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
  <section>
    <div>
      <button @click="boardAPI?.toggleOrientation()">
        Toggle orientation
      </button>
      <button @click="boardAPI?.resetBoard()">Reset</button>
      <button @click="boardAPI?.undoLastMove()">Undo</button>
      <button @click="boardAPI?.toggleMoves()">Threats</button>
    </div>
    <TheChessboard
      :board-config="boardConfig"
      @board-created="(api) => (boardAPI = api)"
      @checkmate="handleCheckmate"
    />
  </section>
</template>
```

Example Javascript Component

```html
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

let boardAPI;
const boardConfig = {
  coordinates: false,
};

function handleCheckmate(isMated) {
  if (isMated === 'w') {
    alert('Black wins!');
  } else {
    alert('White wins!');
  }
}
</script>

<template>
  <section>
    <div>
      <button @click="boardAPI?.toggleOrientation()">
        Toggle orientation
      </button>
      <button @click="boardAPI?.resetBoard()">Reset</button>
      <button @click="boardAPI?.undoLastMove()">Undo</button>
      <button @click="boardAPI?.toggleMoves()">Threats</button>
    </div>
    <TheChessboard
      :board-config="boardConfig"
      @board-created="(api) => (boardAPI = api)"
      @checkmate="handleCheckmate"
    />
  </section>
</template>
```

# Docs
You can find the full documentation [here](https://chessboard.lucahelms.dev).

## Setup:

- Just install the package and import the component in your project, like shown above.
- Don't forget to include the stylesheet: <br>
  `import 'vue3-chessboard/style.css';`

<br>

### Chessboard config

You can pass a config object to the chessboard component to modify the board to your needs, as a prop (:board-config). The config object is optional and will be merged with the [default config](https://github.com/qwerty084/vue3-chessboard/blob/main/src/helper/DefaultConfig.ts).
The default config is based on the [lichess board config](https://github.com/lichess-org/chessground/blob/master/src/state.ts).
Additionally custom callback functions can be passed to the component.
For example a custom function can be run on piece selection or after each move.

### API

The chessboard component provides a class based API to interact with the chessboard. The API is accessible via the board-created event. The event will be emitted when the chessboard is created and the API is ready to use.

### Available methods:

For a full list of available methods please visit the [documentation](https://chessboard.lucahelms.dev/board-api.html).

### Custom Events

You can listen for events on the chessboard component. The following events are available:

- boardCreated - Emitted when the chessboard is created and the API is ready to use
- checkmate - Emitted when a player is checkmated
- stalemate - Emitted when a player is stalemated
- draw - Emitted when the game is drawn
- check - Emitted when a player is checked
- promotion - Emitted when a player promotes
- move - Emitted when a player makes a move

```ts
const emit = defineEmits<{
  (e: 'boardCreated', boardApi: BoardApi): void;
  (e: 'checkmate', isMated: PieceColor): void;
  (e: 'stalemate'): void;
  (e: 'draw'): void;
  (e: 'check', isInCheck: PieceColor): void;
  (e: 'promotion', promotion: PromotionEvent): void;
  (e: 'move', move: MoveEvent): void;
}>();
```
