<script setup lang="ts">
import { ref, type PropType } from 'vue';
import type { Promotion } from '@/typings/Chessboard';
import type { Color } from 'chess.js';

defineProps({
  turnColor: {
    type: String as PropType<Color>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'promotionSelected', piece: Promotion): void;
}>();

const dialogEl = ref<HTMLDialogElement | null>(null);

function promotionSelected(e: Event) {
  if (e.target == null) {
    return;
  }
  const clickedEl = e.target as HTMLDivElement;
  const promotionValue = clickedEl.getAttribute('data-piece');
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
      <div v-if="turnColor === 'w'" class="promotion-container">
        <div class="queen white">
          <button data-piece="q" aria-label="Queen"></button>
        </div>
        <div class="knight white">
          <button data-piece="n" aria-label="Knight"></button>
        </div>
        <div class="rook white">
          <button data-piece="r" aria-label="Rook"></button>
        </div>
        <div class="bishop white">
          <button data-piece="b" aria-label="Bishop"></button>
        </div>
      </div>
      <div v-else class="promotion-container">
        <div class="queen black">
          <button data-piece="q" aria-label="Queen"></button>
        </div>
        <div class="knight black">
          <button data-piece="n" aria-label="Knight"></button>
        </div>
        <div class="rook black">
          <button data-piece="r" aria-label="Rook"></button>
        </div>
        <div class="bishop black">
          <button data-piece="b" aria-label="Bishop"></button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
