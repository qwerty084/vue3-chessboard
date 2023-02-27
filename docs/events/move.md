# Move Event

<br>

This event is emitted after every move on the board.

Definition:

```ts
defineEmits<{
  (e: 'move', move: MoveEvent): void;
}>();

export type MoveEvent = {
  fen: string;
  color: 'b' | 'w';
  from: string;
  to: string;
  piece: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  captured?: 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | undefined;
  promotion?: 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | undefined;
  flags: string;
  san: string;
  lan: string;
};
```

Example:

::: code-group

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

```vue [JavaScript]
<script setup>
import { ref } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleMove(move) {
  console.log(move);
}

<template>
  <TheChessboard @move="handleMove" />
</template>
</script>
```

:::
