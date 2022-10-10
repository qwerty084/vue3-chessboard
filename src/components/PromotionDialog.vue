<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue';
import type { PieceColor } from 'chess.js';
import type { Promotion } from '@/typings/Chessboard';

const props = defineProps({
  turnColor: {
    type: String as () => PieceColor,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'promotionSelected', piece: Promotion): void;
}>();

const dialogEl = ref<HTMLDialogElement | null>(null);
const currentTurnColor = toRef(props, 'turnColor');
const promotionColor = ref<PieceColor>();

onMounted(() => {
  if (currentTurnColor.value === 'w') {
    promotionColor.value = 'b';
  } else {
    promotionColor.value = 'w';
  }
});

function promotionSelected(e: Event) {
  const clickedEl = e.target as HTMLDivElement;
  const promotionValue = clickedEl.getAttribute('data-piece');
  if (promotionValue != null) {
    dialogEl.value?.close();
    emit('promotionSelected', promotionValue as Promotion);
  }
}
</script>

<template>
  <Teleport v-if="promotionColor" to="cg-board">
    <dialog
      ref="dialogEl"
      open
      @click="promotionSelected"
      @touchstart="promotionSelected"
    >
      <div v-if="promotionColor === 'b'" class="promotion-container">
        <div class="promotion queen-w-promotion" data-piece="q"></div>
        <div class="promotion knight-w-promotion" data-piece="k"></div>
        <div class="promotion rook-w-promotion" data-piece="r"></div>
        <div class="promotion bishop-w-promotion" data-piece="b"></div>
      </div>
      <div v-if="promotionColor === 'w'" class="promotion-container">
        <div class="promotion queen-b-promotion" data-piece="q"></div>
        <div class="promotion knight-b-promotion" data-piece="k"></div>
        <div class="promotion rook-b-promotion" data-piece="r"></div>
        <div class="promotion bishop-b-promotion" data-piece="b"></div>
      </div>
    </dialog>
  </Teleport>
</template>
