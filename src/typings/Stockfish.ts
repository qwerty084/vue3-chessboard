import type { ChessInstance } from 'chess.js';
import type { BoardAPI } from './BoardAPI';
import type { StockfishOpts } from './Chessboard';

export interface StockfishClass {
  worker: Worker;
  options: Required<StockfishOpts>;
  boardAPI: BoardAPI;
  engineName: string;
  evaluating: boolean;
  game: ChessInstance;
  score: number | string;
  nps: number;
  currentDepth: string;
  completedEval: number;

  postMessage: (message: string) => void;
  terminate: () => void;
  drawBestMove: (msg: string) => void;
  setOption: (name: string, value: string | number | boolean) => void;
  sendMove: () => void;
  setOptions: () => void;
  startAnalysis: () => void;
  wasmSupported: () => boolean;
  wasmThreadsSupported: () => boolean;
  loadSupportedWorker: () => Worker;
  isEvaluating: () => boolean;
}
