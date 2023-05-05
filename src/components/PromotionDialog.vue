<script setup lang="ts">
import { ref, type PropType } from 'vue';
import type { PieceColor, Promotion } from '@/typings/Chessboard';

defineProps({
  turnColor: {
    type: String as PropType<PieceColor>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'promotionSelected', piece: Promotion): void;
}>();
const dialogEl = ref<HTMLDialogElement | null>(null);

function promotionSelected(e: Event): void {
  if (e.target == null) {
    return;
  }
  const promotionValue = (e.target as HTMLDivElement).getAttribute(
    'data-piece'
  );
  if (promotionValue != null) {
    dialogEl.value?.close();
    emit('promotionSelected', promotionValue as Promotion);
  }
}
</script>

<template>
  <Teleport to="cg-board">
    <dialog
      ref="dialogEl"
      class="promotion-dialog"
      open
      @click="promotionSelected"
      @touchstart.passive="promotionSelected"
    >
      <button
        :class="['queen', turnColor]"
        data-piece="q"
        aria-label="Queen"
      ></button>
      <button
        :class="['knight', turnColor]"
        data-piece="n"
        aria-label="Knight"
      ></button>
      <button
        :class="['rook', turnColor]"
        data-piece="r"
        aria-label="Rook"
      ></button>
      <button
        :class="['bishop', turnColor]"
        data-piece="b"
        aria-label="Bishop"
      ></button>
    </dialog>
  </Teleport>
</template>
