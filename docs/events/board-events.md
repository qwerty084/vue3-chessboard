# Available Events

<br>

- boardCreated (emitted when the board is created)
- checkmate (Emitted when one player is mated)
- stalemate (emitted when the game ends in stalemate)
- draw (emitted when the game is drawn)
- check (emitted when one player is in check)
- promotion (emitted when a promotion occured)
- move (emitted after each move)

<br>
Here you can see the vue.js defineEmits:

```ts
const emit = defineEmits<{
  (e: 'board-created', boardApi: BoardApi): void; // emits boardAPI
  (e: 'checkmate', isMated: PieceColor): void; // emits the color of the mated player
  (e: 'stalemate', isStalemate: boolean): void; // just emits stalemate, the value is not interesting
  (e: 'draw', isDraw: boolean): void; // same for draw
  (e: 'check', isInCheck: PieceColor): void; // emits color who is in check
  (e: 'promotion', promotion: PromotionEvent): void; // emits information about the promotion
  (e: 'move', move: MoveEvent): void; // emits information about the move
}>();
```

## Draw

::: code-group

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

:::
