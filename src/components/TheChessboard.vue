<script setup lang="ts">
import { ref, onMounted, reactive, watch, type Ref } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
import { BoardApi } from '@/classes/BoardApi';
import type { BoardState, Props, Emits } from '@/typings/Chessboard';
import type { BoardConfig } from '@/typings/BoardConfig';
import { deepCopy, deepDiffConfig } from '@/helper/Board';

const props = withDefaults(defineProps<Props>(), {
  boardConfig: () => ({}),
  reactiveConfig: false,
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

  const boardAPI = new BoardApi(boardElement.value, boardState, props, emit);
  emit('boardCreated', boardAPI);

  const oldConfig: Ref<BoardConfig> = ref(deepCopy(props.boardConfig));
  if (props.reactiveConfig)
    watch(reactive(props.boardConfig), (newConfig: BoardConfig) => {
      boardAPI.setConfig(deepDiffConfig(oldConfig.value, newConfig));
      oldConfig.value = deepCopy(newConfig);
    });
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
