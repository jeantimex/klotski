(function() {
  'use strict';

  var HT_BLOCK = 1;
  var HT_VBAR = 2;
  var HT_HBAR = 3;
  var HT_BOX = 4;

  var NO_LR_MIRROR_ALLOW = true;

  var MAX_MOVE_DIRECTION = 4;
  var MAX_WARRIOR_TYPE = 5;

  var HRD_GAME_ROW = 5;
  var HRD_GAME_COL = 4;
  var HRD_BOARD_WIDTH = HRD_GAME_COL + 2;
  var HRD_BOARD_HEIGHT = HRD_GAME_ROW + 2;

  var CAO_ESCAPE_ROW = 3;
  var CAO_ESCAPE_COL = 1;

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

    function isReverseDirection(dirIdx1, dirIdx2) {
      return (dirIdx1 + 2) % MAX_MOVE_DIRECTION === dirIdx2;
    }

    function copyGameState(gameState) {
      var i, j;
      var newBoard = [];
      for (i = 0; i < HRD_BOARD_HEIGHT; i++) {
        newBoard[i] = gameState.board[i].slice(0);
      }

      var newBlocks = [];
      for (i = 0; i < gameState.blocks.length; i++) {
        newBlocks[i] = {
          type: gameState.blocks[i].type,
          row: gameState.blocks[i].row,
          col: gameState.blocks[i].col,
        };
      }

      var newState = {
        board: newBoard,
        blocks: newBlocks,
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
          var type = index >= 0 && index < blocks.length ? blocks[index].type : 0;
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
          var type = index >= 0 && index < blocks.length ? blocks[index].type : 0;
          hash ^= zob_hash.key[i - 1][HRD_GAME_COL - j].value[type];
        }
      }

      return hash;
    }

    function getZobristHashUpdate(gameState, blockIdx, dirIdx, isMirror) {
      var hash = isMirror ? gameState.hashMirror : gameState.hash;
      var block = gameState.blocks[blockIdx];
      var row = block.row;
      var type = block.type;
      var col = isMirror ? HRD_GAME_COL - 1 - block.col : block.col;
      var dx = isMirror ? -1 : 1;
      var dir = directions[isMirror && dirIdx % 2 === 1 ? (dirIdx + 2) % 4 : dirIdx];
      var x = dir.x;
      var y = dir.y;

      switch (block.type) {
        case HT_BLOCK:
          // Clear the old position
          hash ^= zob_hash.key[row][col].value[type];
          hash ^= zob_hash.key[row][col].value[0];
          // Take the new position
          hash ^= zob_hash.key[row + y][col + x].value[0];
          hash ^= zob_hash.key[row + y][col + x].value[type];
          break;
        case HT_VBAR:
          // Clear the old position
          hash ^= zob_hash.key[row][col].value[type];
          hash ^= zob_hash.key[row + 1][col].value[type];
          hash ^= zob_hash.key[row][col].value[0];
          hash ^= zob_hash.key[row + 1][col].value[0];
          // Take the new position
          hash ^= zob_hash.key[row + y][col + x].value[0];
          hash ^= zob_hash.key[row + y + 1][col + x].value[0];
          hash ^= zob_hash.key[row + y][col + x].value[type];
          hash ^= zob_hash.key[row + y + 1][col + x].value[type];
          break;
        case HT_HBAR:
          // Clear the old position
          hash ^= zob_hash.key[row][col].value[type];
          hash ^= zob_hash.key[row][col + dx].value[type];
          hash ^= zob_hash.key[row][col].value[0];
          hash ^= zob_hash.key[row][col + dx].value[0];
          // Take the new position
          hash ^= zob_hash.key[row + y][col + x].value[0];
          hash ^= zob_hash.key[row + y][col + x + dx].value[0];
          hash ^= zob_hash.key[row + y][col + x].value[type];
          hash ^= zob_hash.key[row + y][col + x + dx].value[type];
          break;
        case HT_BOX:
          // Clear the old position
          hash ^= zob_hash.key[row][col].value[type];
          hash ^= zob_hash.key[row][col + dx].value[type];
          hash ^= zob_hash.key[row + 1][col].value[type];
          hash ^= zob_hash.key[row + 1][col + dx].value[type];
          hash ^= zob_hash.key[row][col].value[0];
          hash ^= zob_hash.key[row][col + dx].value[0];
          hash ^= zob_hash.key[row + 1][col].value[0];
          hash ^= zob_hash.key[row + 1][col + dx].value[0];
          // Take the new position
          hash ^= zob_hash.key[row + y][col + dir.x].value[0];
          hash ^= zob_hash.key[row + y][col + dir.x + dx].value[0];
          hash ^= zob_hash.key[row + y + 1][col + x].value[0];
          hash ^= zob_hash.key[row + y + 1][col + x + dx].value[0];
          hash ^= zob_hash.key[row + y][col + x].value[type];
          hash ^= zob_hash.key[row + y][col + x + dx].value[type];
          hash ^= zob_hash.key[row + y + 1][col + x].value[type];
          hash ^= zob_hash.key[row + y + 1][col + x + dx].value[type];
          break;
      }

      return hash;
    }

    function initZobristHash() {
      var i, j;

      zob_hash = { key: [] };

      for (i = 0; i < HRD_GAME_ROW; i++) {
        zob_hash.key[i] = [];

        for (j = 0; j < HRD_GAME_COL; j++) {
          zob_hash.key[i][j] = { value: [] };
          makeCellState(zob_hash.key[i][j]);
        }
      }
    }

    function makeCellState(cr) {
      var i;
      for (i = 0; i < MAX_WARRIOR_TYPE; i++) {
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

    function isPositionAvailable(state, type, row, col) {
      var isOK = false;

      switch (type) {
        case HT_BLOCK:
          isOK = state.board[row + 1][col + 1] === BOARD_CELL_EMPTY;
          break;
        case HT_VBAR:
          isOK =
            state.board[row + 1][col + 1] === BOARD_CELL_EMPTY && state.board[row + 2][col + 1] === BOARD_CELL_EMPTY;
          break;
        case HT_HBAR:
          isOK =
            state.board[row + 1][col + 1] === BOARD_CELL_EMPTY && state.board[row + 1][col + 2] === BOARD_CELL_EMPTY;
          break;
        case HT_BOX:
          isOK =
            state.board[row + 1][col + 1] === BOARD_CELL_EMPTY &&
            state.board[row + 1][col + 2] === BOARD_CELL_EMPTY &&
            state.board[row + 2][col + 1] === BOARD_CELL_EMPTY &&
            state.board[row + 2][col + 2] === BOARD_CELL_EMPTY;
          break;
        default:
          isOK = false;
          break;
      }

      return isOK;
    }

    function canBlockMove(state, blockIdx, dirIdx) {
      var cv1, cv2, cv3, cv4;
      var canMove = false;
      var block = state.blocks[blockIdx];
      var dir = directions[dirIdx];

      switch (block.type) {
        case HT_BLOCK:
          canMove = state.board[block.row + dir.y + 1][block.col + dir.x + 1] == BOARD_CELL_EMPTY;
          break;
        case HT_VBAR:
          cv1 = state.board[block.row + dir.y + 1][block.col + dir.x + 1];
          cv2 = state.board[block.row + dir.y + 2][block.col + dir.x + 1];
          canMove =
            (cv1 == BOARD_CELL_EMPTY || cv1 == blockIdx + 1) && (cv2 == BOARD_CELL_EMPTY || cv2 == blockIdx + 1);
          break;
        case HT_HBAR:
          cv1 = state.board[block.row + dir.y + 1][block.col + dir.x + 1];
          cv2 = state.board[block.row + dir.y + 1][block.col + dir.x + 2];
          canMove =
            (cv1 == BOARD_CELL_EMPTY || cv1 == blockIdx + 1) && (cv2 == BOARD_CELL_EMPTY || cv2 == blockIdx + 1);
          break;
        case HT_BOX:
          cv1 = state.board[block.row + dir.y + 1][block.col + dir.x + 1];
          cv2 = state.board[block.row + dir.y + 2][block.col + dir.x + 1];
          cv3 = state.board[block.row + dir.y + 1][block.col + dir.x + 2];
          cv4 = state.board[block.row + dir.y + 2][block.col + dir.x + 2];
          canMove =
            (cv1 == BOARD_CELL_EMPTY || cv1 == blockIdx + 1) &&
            (cv2 == BOARD_CELL_EMPTY || cv2 == blockIdx + 1) &&
            (cv3 == BOARD_CELL_EMPTY || cv3 == blockIdx + 1) &&
            (cv4 == BOARD_CELL_EMPTY || cv4 == blockIdx + 1);
          break;
        default:
          canMove = false;
          break;
      }

      return canMove;
    }

    function clearPosition(state, type, row, col) {
      switch (type) {
        case HT_BLOCK:
          state.board[row + 1][col + 1] = BOARD_CELL_EMPTY;
          break;
        case HT_VBAR:
          state.board[row + 1][col + 1] = BOARD_CELL_EMPTY;
          state.board[row + 2][col + 1] = BOARD_CELL_EMPTY;
          break;
        case HT_HBAR:
          state.board[row + 1][col + 1] = BOARD_CELL_EMPTY;
          state.board[row + 1][col + 2] = BOARD_CELL_EMPTY;
          break;
        case HT_BOX:
          state.board[row + 1][col + 1] = BOARD_CELL_EMPTY;
          state.board[row + 1][col + 2] = BOARD_CELL_EMPTY;
          state.board[row + 2][col + 1] = BOARD_CELL_EMPTY;
          state.board[row + 2][col + 2] = BOARD_CELL_EMPTY;
          break;
        default:
          break;
      }
    }

    function takePosition(state, blockIdx, type, row, col) {
      switch (type) {
        case HT_BLOCK:
          state.board[row + 1][col + 1] = blockIdx + 1;
          break;
        case HT_VBAR:
          state.board[row + 1][col + 1] = blockIdx + 1;
          state.board[row + 2][col + 1] = blockIdx + 1;
          break;
        case HT_HBAR:
          state.board[row + 1][col + 1] = blockIdx + 1;
          state.board[row + 1][col + 2] = blockIdx + 1;
          break;
        case HT_BOX:
          state.board[row + 1][col + 1] = blockIdx + 1;
          state.board[row + 1][col + 2] = blockIdx + 1;
          state.board[row + 2][col + 1] = blockIdx + 1;
          state.board[row + 2][col + 2] = blockIdx + 1;
          break;
        default:
          break;
      }
    }

    function addGameStateBlock(state, blockIdx, block) {
      if (isPositionAvailable(state, block.type, block.row, block.col)) {
        takePosition(state, blockIdx, block.type, block.row, block.col);
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
        caoIdx: 0,
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
        move: {
          blockIdx: 0,
          dirIdx: 0,
        },
        step: 0,
        hash: 0,
        hashMirror: 0,
        parent: null,
      };

      initZobristHash();
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
            type: blocks[i].type,
            row: blocks[i].position[0],
            col: blocks[i].position[1],
          };

          if (blocks[i].type === 4) {
            game.caoIdx = i;
          }

          if (!addGameStateBlock(state, i, block)) {
            return null;
          }
        }
      } else if (typeof blocks[0] === 'number') {
        for (var i = 0; i < blocks.length; i += 3) {
          var block = {
            type: blocks[i],
            row: blocks[i + 1],
            col: blocks[i + 2],
          };

          if (blocks[i] === 4) {
            game.caoIdx = i / 3;
          }

          if (!addGameStateBlock(state, i / 3, block)) {
            return null;
          }
        }
      } else {
        return null;
      }

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
      var block = gameState.blocks[game.caoIdx];
      return block.row === CAO_ESCAPE_ROW && block.col === CAO_ESCAPE_COL;
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

        clearPosition(newState, block.type, block.row, block.col);
        takePosition(newState, blockIdx, block.type, block.row + dir.y, block.col + dir.x);

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
     * @param {Array} blocks - Starting positions
     * @param {Object} options - Game configuration 
     */
    this.solve = function(blocks, options) {
      if (options.hasOwnProperty('useMirror') && typeof options.useMirror === 'boolean') {
        NO_LR_MIRROR_ALLOW = options.useMirror;
      }

      var game = createGame(blocks);

      if (game) {
        if (resolveGame(game)) {
          return game.result.moves;
        }
      }

      return null;
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
