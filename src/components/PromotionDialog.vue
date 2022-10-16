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
      @touchstart.passive="promotionSelected"
    >
      <div v-show="promotionColor === 'b'" class="promotion-container">
        <div class="promotion queen-w-promotion">
          <button data-piece="q">
            <span class="sr-only">Queen</span>
          </button>
        </div>
        <div class="promotion knight-w-promotion">
          <button data-piece="n">
            <span class="sr-only">Knight</span>
          </button>
        </div>
        <div class="promotion rook-w-promotion">
          <button data-piece="r">
            <span class="sr-only">Rook</span>
          </button>
        </div>
        <div class="promotion bishop-w-promotion">
          <button data-piece="b">
            <span class="sr-only">Bishop</span>
          </button>
        </div>
      </div>
      <div v-show="promotionColor === 'w'" class="promotion-container">
        <div class="promotion queen-b-promotion">
          <button data-piece="q">
            <span class="sr-only">Queen</span>
          </button>
        </div>
        <div class="promotion knight-b-promotion">
          <button data-piece="n"><span class="sr-only">Knight</span></button>
        </div>
        <div class="promotion rook-b-promotion">
          <button data-piece="r"><span class="sr-only">Rook</span></button>
        </div>
        <div class="promotion bishop-b-promotion">
          <button data-piece="b"><span class="sr-only">Bishop</span></button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
