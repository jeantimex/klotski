(function() {
  'use strict';

  var NO_LR_MIRROR_ALLOW = true;

  var MAX_MOVE_DIRECTION = 4;

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
    var directions = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }];
    var directionName = ['Down', 'Right', 'Up', 'Left'];
    var zob_hash;
    var level = 0;

    function getType(types, shape) {
      return types[shape[0] + '-' + shape[1]];
    }

    function setTypes(types, shape) {
      var key = shape[0] + '-' + shape[1];
      if (!types[key]) {
        types[key] = Object.keys(types).length + 1;
      }
    }

    function isReverseDirection(dirIdx1, dirIdx2) {
      return (dirIdx1 + 2) % MAX_MOVE_DIRECTION === dirIdx2;
    }

    function copyGameState(gameState) {
      var newBoard = [];
      for (var i = 0; i < HRD_BOARD_HEIGHT; i++) {
        newBoard[i] = gameState.board[i].slice(0);
      }

      var newBlocks = [];
      for (var i = 0; i < gameState.blocks.length; i++) {
        newBlocks[i] = {
          shape: gameState.blocks[i].shape.slice(0),
          directions: gameState.blocks[i].directions ? gameState.blocks[i].directions.slice(0) : null,
          row: gameState.blocks[i].row,
          col: gameState.blocks[i].col,
        };
      }

      var newTypes = {};
      for (var key in gameState.types) {
        if (gameState.types.hasOwnProperty(key)) {
          newTypes[key] = gameState.types[key];
        }
      }

      var newState = {
        board: newBoard,
        blocks: newBlocks,
        types: newTypes,
        move: {
          blockIdx: gameState.move.blockIdx,
          dirIdx: gameState.move.dirIdx,
        },
        step: gameState.step,
        hash: gameState.hash,
        hashMirror: gameState.hashMirror,
        parent: gameState.parent,
      };

      return newState;
    }

    function getZobristHash(gameState) {
      var i, j;
      var hash = 0;
      var blocks = gameState.blocks;

      for (i = 1; i <= HRD_GAME_ROW; i++) {
        for (j = 1; j <= HRD_GAME_COL; j++) {
          var index = gameState.board[i][j] - 1;
          var type = index >= 0 && index < blocks.length ? getType(gameState.types, blocks[index].shape) : 0;
          hash ^= zob_hash.key[i - 1][j - 1].value[type];
        }
      }

      return hash;
    }

    function getMirrorZobristHash(gameState) {
      var i, j;
      var hash = 0;
      var blocks = gameState.blocks;

      for (i = 1; i <= HRD_GAME_ROW; i++) {
        for (j = 1; j <= HRD_GAME_COL; j++) {
          var index = gameState.board[i][j] - 1;
          var type = index >= 0 && index < blocks.length ? getType(gameState.types, blocks[index].shape) : 0;
          hash ^= zob_hash.key[i - 1][HRD_GAME_COL - j].value[type];
        }
      }

      return hash;
    }

    function getZobristHashUpdate(gameState, blockIdx, dirIdx, isMirror) {
      var hash = isMirror ? gameState.hashMirror : gameState.hash;
      var block = gameState.blocks[blockIdx];
      var shape = block.shape;
      var row = block.row;
      var type = getType(gameState.types, shape);
      var col = isMirror ? HRD_GAME_COL - 1 - block.col : block.col;
      var dx = isMirror ? -1 : 1;
      var dir = directions[isMirror && dirIdx % 2 === 1 ? (dirIdx + 2) % 4 : dirIdx];
      var x = dir.x;
      var y = dir.y;

      // Clear the old position
      for (var i = 0; i < shape[0]; i++) {
        for (var j = 0; j < shape[1]; j++) {
          hash ^= zob_hash.key[row + i][col + j * dx].value[type];
          hash ^= zob_hash.key[row + i][col + j * dx].value[0];
        }
      }

      // Take the new position
      for (var i = 0; i < shape[0]; i++) {
        for (var j = 0; j < shape[1]; j++) {
          hash ^= zob_hash.key[row + y + i][col + x + j * dx].value[0];
          hash ^= zob_hash.key[row + y + i][col + x + j * dx].value[type];
        }
      }

      return hash;
    }

    function initZobristHash(numTypes) {
      var i, j;

      zob_hash = { key: [] };

      for (i = 0; i < HRD_GAME_ROW; i++) {
        zob_hash.key[i] = [];

        for (j = 0; j < HRD_GAME_COL; j++) {
          zob_hash.key[i][j] = { value: [] };
          makeCellState(numTypes, zob_hash.key[i][j]);
        }
      }
    }

    function makeCellState(numTypes, cr) {
      var i;
      for (i = 0; i < numTypes; i++) {
        cr.value[i] = random32();
      }
    }

    function random32() {
      var tmp = 0;

      do {
        tmp = Math.floor(Math.random() * Math.pow(2, 31));
      } while (!tmp);

      return parseInt(tmp);
    }

    function isPositionAvailable(state, shape, row, col) {
      for (var i = 1; i <= shape[0]; i++) {
        for (var j = 1; j <= shape[1]; j++) {
          if (state.board[row + i][col + j] !== BOARD_CELL_EMPTY) {
            return false;
          }
        }
      }
      return true;
    }

    function canBlockMove(state, blockIdx, dirIdx) {
      var block = state.blocks[blockIdx];

      if (block.directions && block.directions.indexOf(dirIdx) === -1) {
        return false;
      }

      var shape = block.shape;
      var dir = directions[dirIdx];

      for (var i = 1; i <= shape[0]; i++) {
        for (var j = 1; j <= shape[1]; j++) {
          var val = state.board[block.row + dir.y + i][block.col + dir.x + j];
          if (val !== BOARD_CELL_EMPTY && val !== blockIdx + 1) {
            return false;
          }
        }
      }

      return true;
    }

    function clearPosition(state, shape, row, col) {
      for (var i = 1; i <= shape[0]; i++) {
        for (var j = 1; j <= shape[1]; j++) {
          state.board[row + i][col + j] = BOARD_CELL_EMPTY;
        }
      }
    }

    function takePosition(state, blockIdx, shape, row, col) {
      for (var i = 1; i <= shape[0]; i++) {
        for (var j = 1; j <= shape[1]; j++) {
          state.board[row + i][col + j] = blockIdx + 1;
        }
      }
    }

    function addGameStateBlock(state, blockIdx, block) {
      if (isPositionAvailable(state, block.shape, block.row, block.col)) {
        takePosition(state, blockIdx, block.shape, block.row, block.col);
        setTypes(state.types, block.shape);
        state.blocks.push(block);
        return true;
      }
      return false;
    }

    function initGameStateBoard(state) {
      var i, j;

      for (i = 0; i < HRD_BOARD_HEIGHT; i++) {
        state.board[i] = [];
        for (j = 0; j < HRD_BOARD_WIDTH; j++) {
          state.board[i][j] = BOARD_CELL_EMPTY;
        }
      }

      for (i = 0; i < HRD_BOARD_WIDTH; i++) {
        state.board[0][i] = BOARD_CELL_BORDER;
        state.board[HRD_BOARD_HEIGHT - 1][i] = BOARD_CELL_BORDER;
      }

      for (i = 1; i < HRD_BOARD_HEIGHT - 1; i++) {
        state.board[i][0] = BOARD_CELL_BORDER;
        state.board[i][HRD_BOARD_WIDTH - 1] = BOARD_CELL_BORDER;
      }
    }

    function createGame(blocks) {
      var game = {
        states: [],
        zhash: {},
        result: {
          time: null,
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

    function markGameState(game, gameState) {
      var l2rHash = gameState.hash;
      game.zhash[l2rHash] = true;

      if (NO_LR_MIRROR_ALLOW) {
        var r2lHash = gameState.hashMirror;
        game.zhash[r2lHash] = true;
      }
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

    function isEscaped(game, gameState) {
      var block = gameState.blocks[0];
      return block.row === ESCAPE_ROW && block.col === ESCAPE_COL;
    }

    function resolveGame(game) {
      var index = 0;

      while (index < game.states.length) {
        var gameState = game.states[index++];

        markGameState(game, gameState);

        if (isEscaped(game, gameState)) {
          outputMoveRecords(game, gameState);
          return true;
        } else {
          searchNewGameStates(game, gameState);
        }
      }

      return false;
    }

    function searchNewGameStates(game, gameState) {
      for (var i = 0; i < gameState.blocks.length; i++) {
        for (var j = 0; j < MAX_MOVE_DIRECTION; j++) {
          trySearchBlockNewState(game, gameState, i, j);
        }
      }
    }

    function trySearchBlockNewState(game, gameState, blockIdx, dirIdx) {
      var newState = moveBlockToNewState(game, gameState, blockIdx, dirIdx);

      if (newState) {
        if (addNewStatePattern(game, newState)) {
          tryBlockContinueMove(game, newState, blockIdx, dirIdx);
          return;
        }
      }
    }

    function moveBlockToNewState(game, gameState, blockIdx, dirIdx) {
      if (canBlockMove(gameState, blockIdx, dirIdx)) {
        var hash = getZobristHashUpdate(gameState, blockIdx, dirIdx);
        if (game.zhash[hash]) {
          return null;
        }

        var hashMirror = 0;
        if (NO_LR_MIRROR_ALLOW) {
          hashMirror = getZobristHashUpdate(gameState, blockIdx, dirIdx, true);
          if (game.zhash[hashMirror]) {
            return null;
          }
        }

        var newState = copyGameState(gameState);
        var block = newState.blocks[blockIdx];
        var dir = directions[dirIdx];

        clearPosition(newState, block.shape, block.row, block.col);
        takePosition(newState, blockIdx, block.shape, block.row + dir.y, block.col + dir.x);

        block.row = block.row + dir.y;
        block.col = block.col + dir.x;

        newState.blocks[blockIdx] = block;

        newState.step = gameState.step + 1;
        newState.parent = gameState;
        newState.move.blockIdx = blockIdx;
        newState.move.dirIdx = dirIdx;

        newState.hash = hash;

        if (NO_LR_MIRROR_ALLOW) {
          newState.hashMirror = hashMirror;
        }
        return newState;
      }

      return null;
    }

    function addNewStatePattern(game, gameState) {
      var l2rHash = gameState.hash;
      var r2lHash = 0;

      if (game.zhash[l2rHash]) {
        return false;
      }

      if (NO_LR_MIRROR_ALLOW) {
        r2lHash = gameState.hashMirror;

        if (game.zhash[r2lHash]) {
          return false;
        }
      }

      game.zhash[l2rHash] = true;

      if (NO_LR_MIRROR_ALLOW) {
        game.zhash[r2lHash] = true;
      }

      game.states.push(gameState);

      return true;
    }

    /**
     *
     * @param {Object} game
     * @param {Object} gameState
     * @param {Number} blockIdx
     * @param {Number} lastDirIdx
     */
    function tryBlockContinueMove(game, gameState, blockIdx, lastDirIdx) {
      for (var d = 0; d < MAX_MOVE_DIRECTION; d++) {
        if (!isReverseDirection(d, lastDirIdx)) {
          var newState = moveBlockToNewState(game, gameState, blockIdx, d);
          if (newState) {
            if (addNewStatePattern(game, newState)) {
              newState.step--;
            }
          }
        }
      }
    }

    /**
     * Solve a klotski game
     *
     * @param {Object} options - Game configuration
     */
    this.solve = function(options) {
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
            if (resolveGame(game)) {
              return game.result.moves.reverse();
            }
          }
        }
      }

      return null;
    };

    this.mergeSteps = function(steps) {
      if (!steps || steps.length === 0) {
        return steps;
      }

      var result = [];
      result[0] = {
        blockIdx: steps[0].blockIdx,
        dirIdx: steps[0].dirIdx,
        count: 1,
      };

      for (var i = 1; i < steps.length; i++) {
        var prev = result[result.length - 1];
        var curr = steps[i];

        if (curr.blockIdx === prev.blockIdx && curr.dirIdx === prev.dirIdx) {
          prev.count++;
        } else {
          result.push({
            blockIdx: curr.blockIdx,
            dirIdx: curr.dirIdx,
            count: 1,
          });
        }
      }

      return result;
    };
  }

  if (typeof define !== 'undefined' && define !== null && define.amd) {
    // AMD
    define(function() {
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
