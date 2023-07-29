# Board Created

<br>

When the board component is mounted the board-created event is being emitted.
In this event the `boardAPI` is included, which you can use to modify and extract data from the board through it's methods.

## Definition

```ts
defineEmits<{
  (e: 'board-created', boardApi: BoardApi): void;
}>();
```

<p>Full reference of all methods: <a href="/board-api.html">Board API Docs</a> | <a href="https://github.com/qwerty084/vue3-chessboard/blob/main/src/classes/BoardApi.ts">Source Code</a></p>

## Example

::: code-group

```vue [JavaScript]
<script setup>
import { onMounted } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

let boardApi;

// access the boardAPI in the onMounted hook
onMounted(() => {
  console.log(boardApi?.getBoardPosition());
});
</script>

<template>
  <TheChessboard @board-created="(api) => (boardApi = api)" />
</template>
```

```vue [TypeScript]
<script setup lang="ts">
import { onMounted } from 'vue';
import { TheChessboard, type BoardApi } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

let boardApi: BoardApi | undefined;

// access the boardAPI in the onMounted hook
onMounted(() => {
  console.log(boardApi?.getBoardPosition());
});
</script>

<template>
  <TheChessboard @board-created="(api) => (boardApi = api)" />
</template>
```

:::
