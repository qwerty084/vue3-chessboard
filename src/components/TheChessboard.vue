<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
import { BoardApi } from '@/classes/BoardApi';
import type { BoardState, Props, Emits } from '@/typings/Chessboard';
import type { BoardConfig } from '@/typings/BoardConfig';

// DONE:
// + Fixed config merging (now does a deep merge/copy and returns a new object instead of mutating arguements)
// + If movable.events.after is supplied in config, patch changeTurn to run before it rather than replace it entirely
// + Added setConfig method to the API
// + Overall refactor to combine redudunant operations and move logic away from Vue component
// + Cleaned up PromotionDialog to be less convoluted
// + Fixed old tests for new internal API structure
// TODO:
// - Add optional config reactivity. Default to false to preserve backwards compatibility as new behaviour may be surprising if implementation doesn't expect it
// - Add tests for new features
// - Update docs
// - Add events for: threefold repition, insufficient material and game over (which returns which type of game over)
// - Fix enpassent animation
// - Fix promotion dialogue click through (if one of your own pieces is behind the selected promotion piece, it will be selected accidentally)
// - Maybe split API into 2 classes? 1 for public exposed API functionality and 1 for private handling of board and game
// - Premove support
// - Game history viewer
// - Fix free move mode
// - Maybe obscure config from user? ie. move entirely to props and emits for more idiomatic Vue component behaviour
// - Possibly engine intergration?

const props = withDefaults(defineProps<Props>(), {
  boardConfig: () => ({} as BoardConfig),
});
const emit = defineEmits<Emits>();

const boardElement = ref<HTMLElement | null>(null);
const boardState: BoardState = reactive({
  showThreats: false,
  promotionDialogState: { isEnabled: false },
});

onMounted(() => {
  if (boardElement.value == null) {
    throw new Error('vue3-chessboard: Failed to mount board.');
  }

  emit(
    'boardCreated',
    new BoardApi(boardElement.value, boardState, props, emit)
  );
});
</script>

<template>
  <section
    class="main-wrap"
    :class="{ disabledBoard: boardState.promotionDialogState.isEnabled }"
  >
    <div class="main-board">
      <div class="dialog-container">
        <PromotionDialog
          v-if="boardState.promotionDialogState.isEnabled"
          :state="boardState.promotionDialogState"
          @promotion-selected="
            boardState.promotionDialogState = { isEnabled: false }
          "
        />
      </div>
      <div ref="boardElement"></div>
    </div>
  </section>
</template>
