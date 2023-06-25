# Move Event

<br>

This event is emitted after every move on the board.

## Definition:

```ts
defineEmits<{
  (e: 'move', move: MoveEvent): void;
}>();

type MoveEvent = {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  flags: string;
  san: string;
  lan: string;
  before: string;
  after: string;
};
```

## Example:

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
