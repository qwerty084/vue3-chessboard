<script setup>
import { TheChessboard } from '../dist/vue3-chessboard';
import { reactive } from 'vue';

const boardConfig = {
  coordinates: false,
  autoCastle: false,
  orientation: 'black',
};

const boardConfig2 = reactive({
  coordinates: true,
  viewOnly: false,
  animation: { enabled: true },
  draggable: { enabled: true },
});
</script>

# Props

Available props:

- `board-config`
- `player-color`
- `reactive-config`

## `board-config`: Configure the chessboard

To edit the chessboard you can pass a configuration object to the component.
Here are all the available options:

```js
// configuration object which can be passed as a prop
{
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // the position to start from as a string
  orientation: 'white', // the orientation of the board
  turnColor: 'white', // the color which starts the game
  coordinates: true, // enable or disable board coordinates
  autoCastle: true, // simplify castling move
  viewOnly: false, // allow or disallow moves on the board
  disableContextMenu: false, // enable/ disable the context menu
  addPieceZIndex: false,
  blockTouchScroll: false,
  highlight: {
    lastMove: true, // highlight the last move on the board
    check: true, // highlight king in check
  },
  animation: { // modify piece animations
    enabled: true,
    duration: 200,
  },
  lastMove: undefined, // this should not be modified
  movable: {
    free: false, // set to true any move is allowed, if false only legal moves
    color: 'white',
    showDests: true,
    dests: possibleMovesWhite,
    events: {},
    rookCastle: true,
  },
  premovable: {
    enabled: true,
    showDests: true,
    castle: true,
    events: {},
  },
  predroppable: {
    enabled: false,
    events: {},
  },
  draggable: {
    enabled: true,
    distance: 3,
    autoDistance: true,
    showGhost: true,
    deleteOnDropOff: false,
  },
  selectable: {
    enabled: true,
  },
  events: {},
  drawable: {
    enabled: true,
    visible: true,
    defaultSnapToValidMove: true,
    eraseOnClick: true,
    shapes: [],
    autoShapes: [],
    brushes: {
      green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
      red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
      blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
      yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
      paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
      paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
      paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
      paleGrey: {
        key: 'pgr',
        color: '#4a4a4a',
        opacity: 0.35,
        lineWidth: 15,
      },
    },
  },
};
```

## Passing the config object to the board

If you dont pass a config object, the default config shown above will be used.
It's not required to set all properties. Your object will be merged with the default config.

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type BoardConfig } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardConfig: BoardConfig = {
  coordinates: false,
  autoCastle: false,
  orientation: 'black',
};
</script>

<template>
  <TheChessboard :board-config="boardConfig" />
</template>
```

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardConfig = {
  coordinates: false,
  autoCastle: false,
  orientation: 'black',
};
</script>

<template>
  <TheChessboard :board-config="boardConfig" />
</template>
```

:::

The board should then look like this:

<div class="chessboard">
  <TheChessboard
    :board-config="boardConfig"
  />
</div>

<style scoped>

.main-wrap {
max-width: 90%;
}
</style>

## `player-color`: Configure the board for multiplayer

The board can accept a player-color prop to denote the color that the corresponding client should be allowed to play. Moves from a players opponent can be applied to the board with the `BoardApi`'s `move` method - the turns will switch once the `move` method is called with a valid sen string. If no value is provided, turns will switch locally.

```vue [TypeScript]
<script setup lang="ts">
import {
  TheChessboard,
  type BoardConfig,
  type BoardApi,
  type MovableColor,
} from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardConfig: BoardConfig = {
  coordinates: false,
  autoCastle: false,
  orientation: 'black',
};
let boardAPI: BoardApi | undefined;
// Client will only be able to play white pieces.
const playerColor: MovableColor = 'white';

// Recieve move from socket/server/etc here.
function onRecieveMove(move: string) {
  boardAPI?.move(move);
}
</script>

<template>
  <TheChessboard :board-config="boardConfig" :player-color="playerColor" />
</template>
```

## `reactive-config`: Using a reactive config object

The `TheChessboard` component can accept a `reactive-config` prop to allow the `board-config` prop to be reactive to changes. Any mutations of the `board-config` prop will propagate to changes of the board config. This works with nested properties in a non-destructive way, ie. setting `boardConfig.draggable = { distance: 10, showGhost: false }` won't affect the other properties of `draggable` on the actual board config, such as `draggable.enabled`. However, it will change the "default state" of the board so that if `boardAPI.resetBoard()` is called the current state of the `board-config` prop is considered to be the provided config, as if it was passed at the time of instantiation of the `TheChessboard` component.

Note that prop mutation is a _one-way flow of data_, so the state of the `board-config` prop won't necessarily reflect the state of the actual board config. For example, as the game progresses the `fen` property of the `board-config` prop **will not** update.

See the following example for how one might make use of this feature:

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { reactive } from 'vue';
import { TheChessboard, type BoardConfig } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardConfig: BoardConfig = reactive({
  coordinates: true,
  viewOnly: false,
  animation: { enabled: true },
  draggable: { enabled: true },
});
</script>

<template>
  <TheChessboard :board-config="boardConfig" reactive-config />
  <div class="buttons">
    <button @click="boardConfig.coordinates = !boardConfig.coordinates">
      Toggle coordinates
    </button>
    <button @click="boardConfig.viewOnly = !boardConfig.viewOnly">
      Toggle view only
    </button>
    <button
      @click="boardConfig.animation!.enabled = !boardConfig.animation!.enabled"
    >
      Toggle animations
    </button>
    <button
      @click="boardConfig.draggable!.enabled = !boardConfig.draggable!.enabled"
    >
      Toggle draggable
    </button>
  </div>
</template>

<style scoped>
.buttons {
  padding: 5px;
  text-align: center;
}
.buttons button {
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
}
</style>
```

```vue [JavaScript]
<script setup>
import { reactive } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardConfig = reactive({
  coordinates: true,
  viewOnly: false,
  animation: { enabled: true },
  draggable: { enabled: true },
});
</script>

<template>
  <TheChessboard :board-config="boardConfig" reactive-config />
  <div class="buttons">
    <button @click="boardConfig.coordinates = !boardConfig.coordinates">
      Toggle coordinates
    </button>
    <button @click="boardConfig.viewOnly = !boardConfig.viewOnly">
      Toggle view only
    </button>
    <button
      @click="boardConfig.animation.enabled = !boardConfig.animation.enabled"
    >
      Toggle animations
    </button>
    <button
      @click="boardConfig.draggable.enabled = !boardConfig.draggable.enabled"
    >
      Toggle draggable
    </button>
  </div>
</template>

<style scoped>
.buttons {
  padding: 5px;
  text-align: center;
}
.buttons button {
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
}
</style>
```

:::

The board should then look like this:

<div>
  <TheChessboard
    :board-config="boardConfig2"
    reactive-config
  />
  <div class="buttons">
    <button
      @click="boardConfig2.coordinates = !boardConfig2.coordinates"
      :class="{ activated: boardConfig2.coordinates }"
    >
      Toggle coordinates
    </button>
    <button
      @click="boardConfig2.viewOnly = !boardConfig2.viewOnly"
      :class="{ activated: !boardConfig2.viewOnly }"
    >
      Toggle view only
    </button>
    <button
      @click="boardConfig2.animation.enabled = !boardConfig2.animation.enabled"
      :class="{ activated: boardConfig2.animation.enabled }"
    >
      Toggle animations
    </button>
    <button
      @click="boardConfig2.draggable.enabled = !boardConfig2.draggable.enabled"
      :class="{ activated: boardConfig2.draggable.enabled }"
    >
      Toggle draggable
    </button>
  </div>
</div>
