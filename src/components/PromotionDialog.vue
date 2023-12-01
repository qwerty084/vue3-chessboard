<script setup lang="ts">
import type {
  PromotionDialogState,
  PromotionPiece,
} from '@/typings/Chessboard';

const props = defineProps<{
  state: PromotionDialogState;
}>();

const emit = defineEmits<{
  (e: 'promotionSelected'): void;
}>();

const promotionPieces: PromotionPiece[] = [
  { name: 'Queen', data: 'q' },
  { name: 'Knight', data: 'n' },
  { name: 'Rook', data: 'r' },
  { name: 'Bishop', data: 'b' },
];

function promotionSelected(piece: PromotionPiece): void {
  props.state.callback?.(piece.data);
  emit('promotionSelected');
}
</script>

<template>
  <dialog class="promotion-dialog" open>
    <button
      v-for="piece in promotionPieces"
      :key="piece.name"
      type="button"
      :class="[piece.name.toLowerCase(), state.color]"
      :aria-label="piece.name"
      @click="promotionSelected(piece)"
      @touchstart.passive="promotionSelected(piece)"
    />
  </dialog>
</template>

<style>
.promotion-dialog {
  padding: 0.8rem;
  position: absolute;
  background-color: #f0d9b5;
  width: 60%;
  z-index: 999;
  top: 41%;
  height: 13%;
  min-height: 40px;
  display: flex;
  border: 2px solid #333;
}

.promotion-dialog button {
  pointer-events: all;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
</style>
