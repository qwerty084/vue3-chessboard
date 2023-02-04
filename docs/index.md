<script setup>
import { ref, watch, onMounted } from 'vue';
import { useData } from 'vitepress';
import { TheChessboard } from '../dist/vue3-chessboard';
import '../dist/style.css';

const theme = useData();
const svgPath = ref(null);

function setSvgPath() {
  if (theme.isDark.value) {
    svgPath.value = '/vue3-chessboard/github-mark-white.svg';
  } else {
    svgPath.value = '/vue3-chessboard/github-mark.svg';
  }
}

onMounted(() => {
  setSvgPath();
});

watch(theme.isDark, () => {
  setSvgPath();
});

const boardAPI = ref();
const boardConfig = {
  coordinates: false,
  autoCastle: false,
};

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

function test(x) {
  console.log(x.target);
}

function wtf(x) {
  console.log(x.target);
}


</script>

# Vue3-Chessboard

## A vue.js component library

<div class="chessboard">
  <TheChessboard
    :board-config="boardConfig"
    @board-created="(api) => (boardAPI = api)"
    @checkmate="handleCheckmate"
  />
</div>

<div class="svg-container">
  <a v-show="theme.isDark" href="https://github.com/qwerty084/vue3-chessboard" target="_blank" rel="noreferrer">
    <img src="/github-mark-white.svg" alt="github repository" title="GitHub Repository" />
  </a>
  <a v-show="!theme.isDark" href="https://github.com/qwerty084/vue3-chessboard" target="_blank" rel="noreferrer">
    <img src="/github-mark.svg" alt="github repository" title="GitHub Repository" />
  </a>
  <a href="https://www.npmjs.com/package/vue3-chessboard" target="_blank" rel="noreferrer" >
    <img src="/npm.svg" alt="NPM Package" title="NPM Package" class="npm-svg" />
  </a>
</div>

<p class="version-number">version 1.0.0</p>

<style>
h1 {
  font-size: 48px !important;
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chessboard {
  margin-top: 10%;
}

.svg-container {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10%;
}

.svg-container img {
  max-width: 36px;
  height: auto;
}

.svg-container .npm-svg {
  max-width: 60px;
}

.version-number {
  text-align: center;
  margin-top: 2rem;
}

.promotion-container {
  background-position: center;
  background-repeat: no-repeat;
}
</style>
