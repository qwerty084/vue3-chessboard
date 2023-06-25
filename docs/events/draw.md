# Draw

<br>

Emitted when the game ends in a draw.

## Definition:

```ts
defineEmits<{
  (e: 'draw'): void;
}>();
```

## Example:

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleDraw() {
  alert('Draw');
}
</script>

<template>
  <TheChessboard @draw="handleDraw" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleDraw() {
  alert('Draw');
}
</script>

<template>
  <TheChessboard @draw="handleDraw" />
</template>
```

:::
