# Board Created

<br>

When the board component is mounted the board-created event gets emitted.
In this event the boardAPI is included, which you can use to modify and extract data from the board.

Definition:

```ts
defineEmits<{
  (e: 'board-created', boardApi: BoardApi): void;
}>();
```

<p>Full reference of all methods: <a href="/board-api.html">Docs</a> | <a href="https://github.com/qwerty084/vue3-chessboard/blob/main/src/classes/BoardApi.ts">Source</a></p>

Example:

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type BoardApi } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardAPI = ref<BoardApi>();
</script>

<template>
  <TheChessboard @board-created="(api) => (boardAPI = api)" />
</template>
```

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardAPI = ref();
</script>

<template>
  <TheChessboard @board-created="(api) => (boardAPI = api)" />
</template>
```

:::
