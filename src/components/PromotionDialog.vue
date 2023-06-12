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
  <Teleport to="cg-board">
    <dialog class="promotion-dialog" open>
      <button
        v-for="piece in promotionPieces"
        :key="piece.name"
        :class="[piece.name.toLowerCase(), state.color]"
        :aria-label="piece.name"
        @click="promotionSelected(piece)"
        @touchstart.passive="promotionSelected(piece)"
      />
    </dialog>
  </Teleport>
</template>
