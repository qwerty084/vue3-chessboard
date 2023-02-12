<script setup lang="ts">
import { ref } from 'vue';
import type { Promotion } from '@/typings/Chessboard';
import type { Color } from 'chess.js';

defineProps({
  turnColor: {
    type: String as () => Color,
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
          <button data-piece="q">
            <span class="sr-only">Queen</span>
          </button>
        </div>
        <div class="knight white">
          <button data-piece="n">
            <span class="sr-only">Knight</span>
          </button>
        </div>
        <div class="rook white">
          <button data-piece="r">
            <span class="sr-only">Rook</span>
          </button>
        </div>
        <div class="bishop white">
          <button data-piece="b">
            <span class="sr-only">Bishop</span>
          </button>
        </div>
      </div>
      <div v-if="turnColor === 'b'" class="promotion-container">
        <div class="queen black">
          <button data-piece="q">
            <span class="sr-only">Queen</span>
          </button>
        </div>
        <div class="knight black">
          <button data-piece="n">
            <span class="sr-only">Knight</span>
          </button>
        </div>
        <div class="rook black">
          <button data-piece="r">
            <span class="sr-only">Rook</span>
          </button>
        </div>
        <div class="bishop black">
          <button data-piece="b">
            <span class="sr-only">Bishop</span>
          </button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
