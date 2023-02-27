# Checkmate

<br>

Emitted when a player is checkmated. In the event the color of the player who got checkmated is included.

Definition:

```ts
defineEmits<{
  (e: 'checkmate', isMated: PieceColor): void;
}>();

export type PieceColor = 'white' | 'black';
```

Example:

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type PieceColor } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheckmate(isMated: PieceColor) {
  alert(`${isMated} is mated`);
}
</script>

<template>
  <TheChessboard @checkmate="handleCheckmate" />
</template>
```

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheck(isMated) {
  alert(`${isMated} is mated`);
}
</script>

<template>
  <TheChessboard @checkmate="handleCheckmate" />
</template>
```

:::
