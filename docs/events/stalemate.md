# Stalemate

<br>

Emitted when the game ends in stalemate.

## Definition

```ts
defineEmits<{
  (e: 'stalemate'): void;
}>();
```

## Example

::: code-group

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleStalemate() {
  alert('Stalemate');
}
</script>

<template>
  <TheChessboard @stalemate="handleStalemate" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handleStalemate() {
  alert('Stalemate');
}
</script>

<template>
  <TheChessboard @stalemate="handleStalemate" />
</template>
```

:::
