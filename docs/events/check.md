# Check

<br>

Emitted when a player is in check. In the event the color of the player who is in check is included.

## Definition

```ts
defineEmits<{
  (e: 'check', isInCheck: PieceColor): void;
}>();

export type PieceColor = 'white' | 'black';
```

## Example

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheck(isInCheck) {
  alert(`${isInCheck} is in Check`);
}
</script>

<template>
  <TheChessboard @check="handleCheck" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type PieceColor } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleCheck(isInCheck: PieceColor) {
  alert(`${isInCheck} is in Check`);
}
</script>

<template>
  <TheChessboard @check="handleCheck" />
</template>
```

:::
