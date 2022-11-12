import {
  defaultStockfishOpts,
  translateStockfishOpts,
} from '@/helper/DefaultConfig';
import type { BoardAPI } from '@/typings/BoardAPI';
import type {
  SquareKey,
  StockfishOpts,
  AvailableStockfishOpts,
} from '@/typings/Chessboard';
import type { StockfishClass } from '@/typings/Stockfish';
import type { ChessInstance } from 'chess.js';

export class Stockfish implements StockfishClass {
  _worker: Worker;
  _options = defaultStockfishOpts;
  _boardAPI: BoardAPI;
  engineName = 'Stockfish';
  evaluating = false;
  _game: ChessInstance;
  score: number | string;
  completedEval: number;

  constructor(
    boardAPI: BoardAPI,
    game: ChessInstance,
    stockfishOpts?: StockfishOpts
  ) {
    this._boardAPI = boardAPI;
    this._game = game;
    this._worker = this.loadSupportedWorker();
    this.worker.postMessage('uci');
    this.score = 0;
    this.completedEval = 0;

    // add option to disable best move for specific color

    if (stockfishOpts) {
      this._options = { ...defaultStockfishOpts, ...stockfishOpts };
    }

    this.worker.addEventListener('message', (event) => {
      const parts = event.data.trim().split(/\s+/g);
      let match: RegExpMatchArray | null;
      // if (event.data.includes('info')) {
      //   console.log(event.data);
      // }
      if ((match = event.data.match(/^info .*\bscore (\w+) (-?\d+)/))) {
        console.log(match);
        const score = parseInt(match[2]) * (game.turn() === 'w' ? 1 : -1);
        if (match[1] === 'cp') {
          this.score = (score / 100.0).toFixed(1);
        } else if (match[1] === 'mate') {
          this.score = 'Mate in ' + Math.abs(score);
        }
      }

      if (parts[0] === 'uciok') {
        this.setOption('UCI_AnalyseMode', 'true');
        this.postMessage('ucinewgame');
        this.postMessage('isready');
      } else if (parts[0] === 'readyok') {
        this.startAnalysis();
      } else if (
        parts[1] === 'depth' &&
        parts[2] >=
          this.options.depth - Math.round(this.options.depth * 0.25) &&
        parts[3] !== 'currmove'
      ) {
        const index = parts.indexOf('pv') + 1;
        this.drawBestMove(parts[index]);
      }

      if (event.data.includes('bestmove')) {
        if (this.options.multiPV !== 1) {
          console.log('get multi pv');
        } else {
          this.drawBestMove(parts.join(' '));
        }
      }
    });
  }

  public postMessage(message: string) {
    this.worker.postMessage(message);
  }

  get worker() {
    return this._worker;
  }

  get game() {
    return this._game;
  }

  get boardAPI() {
    return this._boardAPI;
  }

  get options() {
    return this._options;
  }

  terminate() {
    this.worker.terminate();
  }

  drawBestMove(msg: string) {
    let from: SquareKey;
    let to: SquareKey;

    if (msg.includes(' ')) {
      const move = msg.split(' ')[1];
      const from = move.substring(0, 2) as SquareKey;
      const to = move.substring(2, 4) as SquareKey;
      this.boardAPI.showBestMove([{ orig: from, dest: to }]);
    } else {
      from = msg.substring(0, 2) as SquareKey;
      to = msg.substring(2, 4) as SquareKey;
      this.boardAPI.showBestMove([{ orig: from, dest: to }]);
    }
  }

  setOption(name: string, value: string | number | boolean) {
    this.postMessage(`setoption name ${name} value ${value.toString()}`);
  }

  sendMove() {
    this.setOptions();
    let moves = '';
    this.game
      .history({ verbose: true })
      .map(
        (move) =>
          (moves += ` ${move.from}${move.to}${
            move.promotion ? move.promotion : ''
          }`)
      );
    this.postMessage(`position startpos moves ${moves}`);
    this.postMessage(`go depth ${this.options.depth}`);
  }

  setOptions() {
    Object.entries(this.options).forEach(([key, value]) => {
      if (key in translateStockfishOpts) {
        if (key === 'hashSize' && value > 968) {
          value = 150;
          // value = 125;
        }
        this.setOption(
          translateStockfishOpts[key as keyof AvailableStockfishOpts],
          value
        );
      }
    });
  }

  startAnalysis() {
    this.setOptions();
    this.postMessage('position startpos');
    this.postMessage(`go depth ${this.options.depth}`);
  }

  wasmSupported() {
    return (
      typeof WebAssembly === 'object' &&
      WebAssembly.validate(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      )
    );
  }

  wasmThreadsSupported() {
    if (
      typeof WebAssembly !== 'object' ||
      typeof WebAssembly.validate !== 'function'
    )
      return false;
    if (
      !WebAssembly.validate(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      )
    )
      return false;

    if (typeof SharedArrayBuffer !== 'function') return false;

    if (typeof Atomics !== 'object') return false;

    const mem = new WebAssembly.Memory({
      shared: true,
      initial: 8,
      maximum: 16,
    });
    if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

    try {
      window.postMessage(mem, '*');
    } catch (e) {
      return false;
    }

    try {
      mem.grow(8);
    } catch (e) {
      return false;
    }

    return true;
  }

  loadSupportedWorker() {
    // TODO: löschen TESTING
    // return new Worker('engines/fallback/stockfish.js');
    // return new Worker('engines/fallback/stockfish.asm.js');

    if (this.wasmThreadsSupported()) {
      this.engineName = 'Stockfish 15 64 WASM Multithreaded';
      if (this.options.useNNUE) {
        this.engineName += ' NNUE';
      }
      return new Worker('engines/stockfish.js');
    } else {
      if (this.wasmSupported()) {
        this.engineName = 'Stockfish 11 WASM';
        return new Worker('engines/fallback/stockfish.js');
      } else {
        this.engineName = 'Stockfish 11 ASM';
        return new Worker('engines/fallback/stockfish.asm.js');
      }
    }
  }

  isEvaluating() {
    return this.evaluating;
  }
}
