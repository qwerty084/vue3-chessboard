<script setup>
import { TheChessboard } from '../dist/vue3-chessboard';
import '../dist/style.css';

const boardConfig = {
  coordinates: false,
  autoCastle: false,
  orientation: 'black',
};

</script>

# Board props

## Configure the chessboard

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
