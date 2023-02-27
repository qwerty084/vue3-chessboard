# Promotion

<br>

Emitted when a promotion occurs.

Definition:

```ts
defineEmits<{
  (e: 'promotion', promotion: PromotionEvent): void;
}>();

export interface PromotionEvent {
  color: 'white' | 'black';
  sanMove: string;
  promotedTo: 'Q' | 'B' | 'R' | 'N';
}
```

Example:

::: code-group

```vue [TypeScript]
<script setup lang="ts">
import { TheChessboard, type PromotionEvent } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handlePromotion(promotion: PromotionEvent) {
  console.log(promotion);
}
</script>

<template>
  <TheChessboard @promotion="handlePromotion" />
</template>
```

```vue [JavaScript]
<script setup>
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

function handlePromotion(e) {
  console.log(e);
}
</script>

<template>
  <TheChessboard @promotion="handlePromotion" />
</template>
```

:::
