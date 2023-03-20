<script setup>
import { ref, watch, onMounted } from 'vue';
import { useData } from 'vitepress';
import { TheChessboard } from '../dist/vue3-chessboard';

const theme = useData();
const svgPath = ref(null);

function setSvgPath() {
  if (theme.isDark.value) {
    svgPath.value = '/github-mark-white.svg';
  } else {
    svgPath.value = '/github-mark.svg';
  }
}

onMounted(() => {
  setSvgPath();
});

watch(theme.isDark, () => {
  setSvgPath();
});

const boardAPI = ref();

function handleCheckmate(isMated) {
  if (isMated === 'w') {
    alert('Black wins!');
  } else {
    alert('White wins!');
  }
  console.log(boardAPI.value);
  boardAPI.value.resetBoard();
}

function toggleOrientation() {
  boardAPI.value?.board.toggleOrientation();
}

function resetBoard() {
  boardAPI.value?.resetBoard();
}

</script>

# Vue3-Chessboard

## A vue.js component library

<div class="chessboard">
  <TheChessboard
    @board-created="(api) => (boardAPI = api)"
    @checkmate="handleCheckmate"
  />
</div>

<div class="svg-container">
  <a v-show="theme.isDark" href="https://github.com/qwerty084/vue3-chessboard" target="_blank" rel="noreferrer">
    <img :src="svgPath" alt="github repository" title="GitHub Repository" />
  </a>
  <a href="https://www.npmjs.com/package/vue3-chessboard" target="_blank" rel="noreferrer" >
    <img src="/npm.svg" alt="NPM Package" title="NPM Package" class="npm-svg" />
  </a>
</div>

<p class="version-number">v1.1.3</p>
