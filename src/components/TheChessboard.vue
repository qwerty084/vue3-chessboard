<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import PromotionDialog from './PromotionDialog.vue';
import { Api } from '@/classes/Api';
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
  historyViewerState: { isEnabled: false },
});

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const api = new Api(boardElement.value!, boardState, props, emit);
  emit('boardCreated', api);

  if (props.reactiveConfig) {
    let oldConfig: BoardConfig = deepCopy(props.boardConfig);
    watch(reactive(props.boardConfig), (newConfig: BoardConfig) => {
      api.setConfig(deepDiffConfig(oldConfig, newConfig));
      oldConfig = deepCopy(newConfig);
    });
  }
});
</script>

<template>
  <section
    class="main-wrap"
    :class="{
      disabledBoard: boardState.promotionDialogState.isEnabled,
      viewingHistory: boardState.historyViewerState.isEnabled,
    }"
  >
    <div class="main-board">
      <PromotionDialog
        v-if="boardState.promotionDialogState.isEnabled"
        :state="boardState.promotionDialogState"
        @promotion-selected="
          boardState.promotionDialogState = { isEnabled: false }
        "
      />
      <div ref="boardElement"></div>
    </div>
  </section>
</template>
