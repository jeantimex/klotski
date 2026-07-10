(function () {
  'use strict';

  var NO_LR_MIRROR_ALLOW = true;

  var HRD_GAME_ROW = 5;
  var HRD_GAME_COL = 4;
  var HRD_BOARD_WIDTH = HRD_GAME_COL + 2;
  var HRD_BOARD_HEIGHT = HRD_GAME_ROW + 2;

  var ESCAPE_ROW = 3;
  var ESCAPE_COL = 1;

  var BOARD_CELL_EMPTY = 0;
  var BOARD_CELL_BORDER = -1;

  function Klotski() {
    /**
     * Private variables
     */
    var DIR_X = [0, 1, 0, -1];
    var DIR_Y = [1, 0, -1, 0];
    var zob_hash;
    var zob_numTypes;

    function setTypes(types, shape) {
      var key = shape[0] + '-' + shape[1];
      if (!types[key]) {
        types[key] = Object.keys(types).length + 1;
      }
      return types[key];
    }

    function getZobristHash(gameState) {
      var hash = 0;
      var blocks = gameState.blocks;
      var board = gameState.board;
      var numBlocks = blocks.length;

      for (var i = 0; i < HRD_GAME_ROW; i++) {
        var rowOffset = (i + 1) * HRD_BOARD_WIDTH + 1;
        var zobRowOffset = i * HRD_GAME_COL * zob_numTypes;
        for (var j = 0; j < HRD_GAME_COL; j++) {
          var index = board[rowOffset + j] - 1;
          var type = index >= 0 && index < numBlocks ? blocks[index].type : 0;
          hash ^= zob_hash[zobRowOffset + j * zob_numTypes + type];
        }
      }

      return hash;
    }

    function getMirrorZobristHash(gameState) {
      var hash = 0;
      var blocks = gameState.blocks;
      var board = gameState.board;
      var numBlocks = blocks.length;

      for (var i = 0; i < HRD_GAME_ROW; i++) {
        var rowOffset = (i + 1) * HRD_BOARD_WIDTH + 1;
        var zobRowOffset = i * HRD_GAME_COL * zob_numTypes;
        for (var j = 0; j < HRD_GAME_COL; j++) {
          var index = board[rowOffset + j] - 1;
          var type = index >= 0 && index < numBlocks ? blocks[index].type : 0;
          hash ^= zob_hash[zobRowOffset + (HRD_GAME_COL - 1 - j) * zob_numTypes + type];
        }
      }

      return hash;
    }

    function getZobristHashUpdate(gameState, blockIdx, dirIdx, isMirror) {
      var hash = isMirror ? gameState.hashMirror : gameState.hash;
      var block = gameState.blocks[blockIdx];
      var shape = block.shape;
      var row = block.row;
      var type = block.type;
      var col = isMirror ? HRD_GAME_COL - 1 - block.col : block.col;
      var dx = isMirror ? -1 : 1;
      var actualDir = isMirror && dirIdx % 2 === 1 ? (dirIdx + 2) % 4 : dirIdx;
      var x = DIR_X[actualDir];
      var y = DIR_Y[actualDir];

      if (y !== 0) {
        var rowToClear = y > 0 ? row : row + shape[0] - 1;
        var rowToFill = y > 0 ? row + shape[0] : row - 1;
        for (var j = 0; j < shape[1]; j++) {
          var clearCol = col + j * dx;
          var fillCol = col + x + j * dx;
          var clearIdx = (rowToClear * HRD_GAME_COL + clearCol) * zob_numTypes;
          var fillIdx = (rowToFill * HRD_GAME_COL + fillCol) * zob_numTypes;
          hash ^= zob_hash[clearIdx + type];
          hash ^= zob_hash[clearIdx];
          hash ^= zob_hash[fillIdx];
          hash ^= zob_hash[fillIdx + type];
        }
        return hash;
      }

      var clearEdge = x > 0 ? (dx > 0 ? 0 : shape[1] - 1) : dx > 0 ? shape[1] - 1 : 0;
      var fillEdge = x > 0 ? (dx > 0 ? shape[1] - 1 : 0) : dx > 0 ? 0 : shape[1] - 1;
      var colToClear = col + clearEdge * dx;
      var colToFill = col + x + fillEdge * dx;
      for (var i = 0; i < shape[0]; i++) {
        var clearRow = row + i;
        var fillRow = row + i;
        var clearIdx = (clearRow * HRD_GAME_COL + colToClear) * zob_numTypes;
        var fillIdx = (fillRow * HRD_GAME_COL + colToFill) * zob_numTypes;
        hash ^= zob_hash[clearIdx + type];
        hash ^= zob_hash[clearIdx];
        hash ^= zob_hash[fillIdx];
        hash ^= zob_hash[fillIdx + type];
      }

      return hash;
    }

    function initZobristHash(numTypes) {
      zob_numTypes = numTypes;
      var size = HRD_GAME_ROW * HRD_GAME_COL * numTypes;
      zob_hash = new Uint32Array(size);
      for (var i = 0; i < size; i++) {
        zob_hash[i] = (Math.random() * 0x100000000) >>> 0;
      }
    }

    function isPositionAvailable(state, shape, row, col) {
      for (var i = 1; i <= shape[0]; i++) {
        for (var j = 1; j <= shape[1]; j++) {
          if (state.board[(row + i) * HRD_BOARD_WIDTH + col + j] !== BOARD_CELL_EMPTY) {
            return false;
          }
        }
      }
      return true;
    }

    function takePosition(state, blockIdx, shape, row, col) {
      for (var i = 1; i <= shape[0]; i++) {
        for (var j = 1; j <= shape[1]; j++) {
          state.board[(row + i) * HRD_BOARD_WIDTH + col + j] = blockIdx + 1;
        }
      }
    }

    function addGameStateBlock(state, blockIdx, block) {
      if (isPositionAvailable(state, block.shape, block.row, block.col)) {
        takePosition(state, blockIdx, block.shape, block.row, block.col);
        block.type = setTypes(state.types, block.shape);
        state.blocks.push(block);
        return true;
      }
      return false;
    }

    function initGameStateBoard(state) {
      state.board = new Int8Array(HRD_BOARD_WIDTH * HRD_BOARD_HEIGHT);

      for (var i = 0; i < HRD_BOARD_WIDTH; i++) {
        state.board[i] = BOARD_CELL_BORDER;
        state.board[(HRD_BOARD_HEIGHT - 1) * HRD_BOARD_WIDTH + i] = BOARD_CELL_BORDER;
      }

      for (var j = 1; j < HRD_BOARD_HEIGHT - 1; j++) {
        state.board[j * HRD_BOARD_WIDTH] = BOARD_CELL_BORDER;
        state.board[j * HRD_BOARD_WIDTH + HRD_BOARD_WIDTH - 1] = BOARD_CELL_BORDER;
      }
    }

    function createGame(blocks) {
      var game = {
        states: [],
        result: {
          moves: [],
        },
      };

      var state = {
        board: [],
        blocks: [],
        types: {},
        move: {
          blockIdx: 0,
          dirIdx: 0,
        },
        step: 0,
        hash: 0,
        hashMirror: 0,
        parent: null,
      };

      initGameStateBoard(state);

      state.parent = null;
      state.step = 0;
      state.move.blockIdx = 0;
      state.move.dirIdx = 0;

      if (!blocks || blocks.length === 0) {
        return null;
      }

      if (typeof blocks[0] === 'object') {
        for (var i = 0; i < blocks.length; i++) {
          var block = {
            shape: blocks[i].shape,
            row: blocks[i].position[0],
            col: blocks[i].position[1],
            directions: blocks[i].directions || null,
          };

          if (!addGameStateBlock(state, i, block)) {
            return null;
          }
        }
      } else {
        return null;
      }

      var numTypes = Object.keys(state.types).length;
      initZobristHash(numTypes);

      state.hash = getZobristHash(state);
      state.hashMirror = getMirrorZobristHash(state);

      game.states.push(state);

      return game;
    }

    function outputMoveRecords(game, gameState) {
      var state = gameState;
      while (state) {
        if (state.step > 0) {
          var move = {
            step: state.step,
            blockIdx: state.move.blockIdx,
            dirIdx: state.move.dirIdx,
          };
          game.result.moves.push(move);
        }
        state = state.parent;
      }
    }

    function resolveGame(game, options) {
      var buckets = [];
      var bucketHeads = [];
      var minStep = 0;
      var queueSize = 0;

      var isSingle = options && options.singleMove;
      var visited = new Map();
      var initialState = game.states[0];
      var numBlocks = initialState.blocks.length;

      if (isSingle) {
        visited.set(initialState.hash, 0);
        if (NO_LR_MIRROR_ALLOW) {
          visited.set(initialState.hashMirror, 0);
        }
      }

      buckets[0] = [initialState];
      bucketHeads[0] = 0;
      queueSize = 1;

      while (queueSize > 0) {
        while (!buckets[minStep] || bucketHeads[minStep] >= buckets[minStep].length) {
          minStep++;
        }
        queueSize--;
        var gameState = buckets[minStep][bucketHeads[minStep]++];

        var block0 = gameState.blocks[0];
        if (block0.row === ESCAPE_ROW && block0.col === ESCAPE_COL) {
          outputMoveRecords(game, gameState);
          return true;
        }

        var parentBlockIdx = gameState.parent !== null ? gameState.move.blockIdx : -1;
        var parentDirIdx = gameState.move.dirIdx;
        var stateStep = gameState.step;
        var stateBoard = gameState.board;
        var stateBlocks = gameState.blocks;

        for (var i = 0; i < numBlocks; i++) {
          var block = stateBlocks[i];
          var blockDirections = block.directions;
          var shape = block.shape;
          var shapeRows = shape[0];
          var shapeCols = shape[1];
          var blockRow = block.row;
          var blockCol = block.col;

          for (var dirIdx = 0; dirIdx < 4; dirIdx++) {
            if (blockDirections && blockDirections.indexOf(dirIdx) === -1) {
              continue;
            }

            var dirX = DIR_X[dirIdx];
            var dirY = DIR_Y[dirIdx];
            var canMove = true;

            if (dirY !== 0) {
              var checkRow = dirY > 0 ? blockRow + shapeRows + 1 : blockRow;
              for (var j = 1; j <= shapeCols; j++) {
                var val = stateBoard[checkRow * HRD_BOARD_WIDTH + blockCol + j];
                if (val !== BOARD_CELL_EMPTY && val !== i + 1) {
                  canMove = false;
                  break;
                }
              }
            } else {
              var checkCol = dirX > 0 ? blockCol + shapeCols + 1 : blockCol;
              for (var k = 1; k <= shapeRows; k++) {
                var val = stateBoard[(blockRow + k) * HRD_BOARD_WIDTH + checkCol];
                if (val !== BOARD_CELL_EMPTY && val !== i + 1) {
                  canMove = false;
                  break;
                }
              }
            }

            if (!canMove) continue;

            var hash = getZobristHashUpdate(gameState, i, dirIdx);
            var hashMirror = NO_LR_MIRROR_ALLOW ? getZobristHashUpdate(gameState, i, dirIdx, true) : 0;

            var isContinue = !isSingle && parentBlockIdx === i && (dirIdx + 2) % 4 !== parentDirIdx;
            var newStep = isContinue ? stateStep : stateStep + 1;

            var compositeKey = isSingle ? hash : hash * 16 + i;
            var visitedStep = visited.get(compositeKey);
            if (visitedStep !== undefined && visitedStep <= newStep) {
              continue;
            }

            if (NO_LR_MIRROR_ALLOW) {
              var mirrorKey = isSingle ? hashMirror : hashMirror * 16 + i;
              var visitedMirrorStep = visited.get(mirrorKey);
              if (visitedMirrorStep !== undefined && visitedMirrorStep <= newStep) {
                continue;
              }
            }

            var newBoard = stateBoard.slice(0);
            var newRow = blockRow + dirY;
            var newCol = blockCol + dirX;

            for (var ri = 1; ri <= shapeRows; ri++) {
              for (var ci = 1; ci <= shapeCols; ci++) {
                newBoard[(blockRow + ri) * HRD_BOARD_WIDTH + blockCol + ci] = BOARD_CELL_EMPTY;
              }
            }
            for (var ri = 1; ri <= shapeRows; ri++) {
              for (var ci = 1; ci <= shapeCols; ci++) {
                newBoard[(newRow + ri) * HRD_BOARD_WIDTH + newCol + ci] = i + 1;
              }
            }

            var newBlocks = new Array(numBlocks);
            for (var bi = 0; bi < numBlocks; bi++) {
              if (bi === i) {
                newBlocks[bi] = {
                  shape: shape,
                  directions: blockDirections,
                  type: block.type,
                  row: newRow,
                  col: newCol,
                };
              } else {
                newBlocks[bi] = stateBlocks[bi];
              }
            }

            var newState = {
              board: newBoard,
              blocks: newBlocks,
              move: { blockIdx: i, dirIdx: dirIdx },
              step: newStep,
              hash: hash,
              hashMirror: hashMirror,
              parent: gameState,
            };

            visited.set(compositeKey, newStep);
            if (NO_LR_MIRROR_ALLOW) {
              visited.set(mirrorKey, newStep);
            }

            if (!buckets[newStep]) {
              buckets[newStep] = [];
              bucketHeads[newStep] = 0;
            }
            buckets[newStep].push(newState);
            queueSize++;
          }
        }
      }

      return false;
    }

    /**
     * Solve a klotski game
     *
     * @param {Object} options - Game configuration
     */
    this.solve = function (options) {
      if (options) {
        if (options.hasOwnProperty('useMirror') && typeof options.useMirror === 'boolean') {
          NO_LR_MIRROR_ALLOW = options.useMirror;
        }

        if (
          options.hasOwnProperty('boardSize') &&
          Object.prototype.toString.call(options.boardSize) === '[object Array]' &&
          options.boardSize.length === 2
        ) {
          HRD_GAME_ROW = options.boardSize[0];
          HRD_GAME_COL = options.boardSize[1];
          HRD_BOARD_WIDTH = HRD_GAME_COL + 2;
          HRD_BOARD_HEIGHT = HRD_GAME_ROW + 2;
        }

        if (
          options.hasOwnProperty('escapePoint') &&
          Object.prototype.toString.call(options.escapePoint) === '[object Array]' &&
          options.escapePoint.length === 2
        ) {
          ESCAPE_ROW = options.escapePoint[0];
          ESCAPE_COL = options.escapePoint[1];
        }

        if (options.hasOwnProperty('blocks') && Object.prototype.toString.call(options.blocks) === '[object Array]') {
          var game = createGame(options.blocks);

          if (game) {
            if (resolveGame(game, options)) {
              return game.result.moves.reverse();
            }
          }
        }
      }

      return null;
    };

    this.mergeSteps = function (steps) {
      if (!steps || steps.length === 0) {
        return steps;
      }

      var result = [];
      result[0] = {
        blockIdx: steps[0].blockIdx,
        dirIdx: steps[0].dirIdx,
        step: steps[0].step,
        count: 1,
      };

      for (var i = 1; i < steps.length; i++) {
        var prev = result[result.length - 1];
        var curr = steps[i];

        if (curr.blockIdx === prev.blockIdx && curr.dirIdx === prev.dirIdx) {
          prev.count++;
          prev.step = curr.step;
        } else {
          result.push({
            blockIdx: curr.blockIdx,
            dirIdx: curr.dirIdx,
            step: curr.step,
            count: 1,
          });
        }
      }

      return result;
    };
  }

  if (typeof define !== 'undefined' && define !== null && define.amd) {
    // AMD
    define(function () {
      return Klotski;
    });
  } else if (
    typeof module !== 'undefined' &&
    module !== null &&
    typeof exports !== 'undefined' &&
    module.exports === exports
  ) {
    // CommonJS
    module.exports = Klotski;
  } else if (
    typeof self !== 'undefined' &&
    typeof self.postMessage === 'function' &&
    typeof self.importScripts === 'function'
  ) {
    // Web Worker
    self.Klotski = Klotski;
  } else if (typeof window !== 'undefined' && window !== null) {
    // Browser main thread
    window.Klotski = Klotski;
  }
})();
