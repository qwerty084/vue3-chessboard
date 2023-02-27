<script setup>
import { ref } from 'vue';
import { TheChessboard } from '../dist/vue3-chessboard';

const boardConfig = {
  coordinates: false,
  autoCastle: false,
  events: {
    change: () => {
      changeCounter.value++;
    },
    move: (from, to, capture) => {
      lastMove.value = { from, to, capture };
    },
    select(key) {
      square.value = key;
    },
  },
};

const changeCounter = ref(0);
const lastMove = ref({
  from: null,
  to: null,
  capture: null,
});
const square = ref('');

</script>

# Board Callbacks

## Registering Callback functions

You can register custom callback functions on the board through the config object.
Like each other config property, this is optional.

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type BoardConfig } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardConfig: BoardConfig = {
  events: {
    change: () => {
      // called after the situation changes on the board
      console.log('Something changed!');
    },
    move: (from, to, capture) => {
      // the move function fires after each move on the board, you can access the values from, to, and capture
      console.log(from, to, capture);
    },
    select(key) {
      // called when a square is selected
      // the param key is the square being selected: e.g. d2 or e2...
      console.log(key);
    },
  },
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
  events: {
    change: () => {
      // called after the situation changes on the board
      console.log('Something changed!');
    },
    move: (from, to, capture) => {
      // the move function fires after each move on the board, you can access the values from, to, and capture
      console.log(from, to, capture);
    },
    select(key) {
      // called when a square is selected
      // the param key is the square being selected: e.g. d2 or e2...
      console.log(key);
    },
  },
};
</script>

<template>
  <TheChessboard :board-config="boardConfig" />
</template>
```

:::

### Example

<br>

<p>Change Counter: {{ changeCounter }}</p>
<p>Latest Move: {{lastMove }}</p>
<p v-if="square">Square {{ square }} has been selected</p>
<p v-else>No square has been selected yet</p>

<div class="chessboard">
  <TheChessboard
    :board-config="boardConfig"
  />
</div>

<br>

There are two more methods, which aren't listed above:

- insert
- dropNewPiece

The insert method is fired when a new chessboard is mounted.
You probably will not need this.

dropNewPiece is fired when a new piece is inserted. This feature isnt used currently.
