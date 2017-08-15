(function () {
  'use strict';

  var HT_BLOCK = 1;
  var HT_VBAR = 2;
  var HT_HBAR = 3;
  var HT_BOX = 4;

  var NO_LR_MIRROR_ALLOW = true;

  var MAX_HERO_COUNT = 10;
  var MAX_MOVE_DIRECTION = 4;
  var MAX_WARRIOR_TYPE = 5;

  var HRD_GAME_ROW = 5;
  var HRD_GAME_COL = 4;
  var HRD_BOARD_WIDTH = 6;
  var HRD_BOARD_HEIGHT = 7;

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

      var newHeroes = [];
      for (i = 0; i < gameState.heroes.length; i++) {
        newHeroes[i] = {
          type: gameState.heroes[i].type,
          row: gameState.heroes[i].row,
          col: gameState.heroes[i].col,
        };
      }

      var newState = {
        board: newBoard,
        heroes: newHeroes,
        move: {
          heroIdx: gameState.move.heroIdx,
          dirIdx: gameState.move.dirIdx,
        },
        step: gameState.step,
        hash: gameState.hash,
        hashMirror: gameState.hashMirror,
        parent: gameState.parent,
      };

      return newState;
    }

    function directionStringFromIndex(dirIdx) {
      //assert(dirIdx >= 0 && dirIdx < MAX_MOVE_DIRECTION);
      if (dirIdx >= 0 && dirIdx < MAX_MOVE_DIRECTION) {
        return directionName[dirIdx];
      }
      return '';
    }

    function getZobristHash(gameState) {
      var i, j;
      var hash = 0;
      var heroes = gameState.heroes;

      for (i = 1; i <= HRD_GAME_ROW; i++) {
        for (j = 1; j <= HRD_GAME_COL; j++) {
          var index = gameState.board[i][j] - 1;
          var type = index >= 0 && index < heroes.length ? heroes[index].type : 0;
          hash ^= zob_hash.key[i - 1][j - 1].value[type];
        }
      }

      return hash;
    }

    function getMirrorZobristHash(gameState) {
      var i, j;
      var hash = 0;
      var heroes = gameState.heroes;

      for (i = 1; i <= HRD_GAME_ROW; i++) {
        for (j = 1; j <= HRD_GAME_COL; j++) {
          var index = gameState.board[i][j] - 1;
          var type = index >= 0 && index < heroes.length ? heroes[index].type : 0;
          hash ^= zob_hash.key[i - 1][HRD_GAME_COL - j].value[type];
        }
      }

      return hash;
    }

    function getZobristHashUpdate(gameState, heroIdx, dirIdx, isMirror) {
      var hash = isMirror ? gameState.hashMirror : gameState.hash;
      var hero = gameState.heroes[heroIdx];
      var row = hero.row;
      var type = hero.type;
      var col = isMirror ? HRD_GAME_COL - 1 - hero.col : hero.col;
      var dx = isMirror ? -1 : 1;
      var dir = directions[isMirror && dirIdx % 2 === 1 ? (dirIdx + 2) % 4 : dirIdx];
      var x = dir.x;
      var y = dir.y;

      switch (hero.type) {
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
      let isOK = false;

      switch (type) {
        case HT_BLOCK:
          isOK = state.board[row + 1][col + 1] === BOARD_CELL_EMPTY;
          break;
        case HT_VBAR:
          isOK = state.board[row + 1][col + 1] === BOARD_CELL_EMPTY && state.board[row + 2][col + 1] === BOARD_CELL_EMPTY;
          break;
        case HT_HBAR:
          isOK = state.board[row + 1][col + 1] === BOARD_CELL_EMPTY && state.board[row + 1][col + 2] === BOARD_CELL_EMPTY;
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

    function canHeroMove(state, heroIdx, dirIdx) {
      var cv1, cv2, cv3, cv4;
      var canMove = false;
      var hero = state.heroes[heroIdx];
      var dir = directions[dirIdx];

      switch (hero.type) {
        case HT_BLOCK:
          canMove = state.board[hero.row + dir.y + 1][hero.col + dir.x + 1] == BOARD_CELL_EMPTY;
          break;
        case HT_VBAR:
          cv1 = state.board[hero.row + dir.y + 1][hero.col + dir.x + 1];
          cv2 = state.board[hero.row + dir.y + 2][hero.col + dir.x + 1];
          canMove = (cv1 == BOARD_CELL_EMPTY || cv1 == heroIdx + 1) && (cv2 == BOARD_CELL_EMPTY || cv2 == heroIdx + 1);
          break;
        case HT_HBAR:
          cv1 = state.board[hero.row + dir.y + 1][hero.col + dir.x + 1];
          cv2 = state.board[hero.row + dir.y + 1][hero.col + dir.x + 2];
          canMove = (cv1 == BOARD_CELL_EMPTY || cv1 == heroIdx + 1) && (cv2 == BOARD_CELL_EMPTY || cv2 == heroIdx + 1);
          break;
        case HT_BOX:
          cv1 = state.board[hero.row + dir.y + 1][hero.col + dir.x + 1];
          cv2 = state.board[hero.row + dir.y + 2][hero.col + dir.x + 1];
          cv3 = state.board[hero.row + dir.y + 1][hero.col + dir.x + 2];
          cv4 = state.board[hero.row + dir.y + 2][hero.col + dir.x + 2];
          canMove =
            (cv1 == BOARD_CELL_EMPTY || cv1 == heroIdx + 1) &&
            (cv2 == BOARD_CELL_EMPTY || cv2 == heroIdx + 1) &&
            (cv3 == BOARD_CELL_EMPTY || cv3 == heroIdx + 1) &&
            (cv4 == BOARD_CELL_EMPTY || cv4 == heroIdx + 1);
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

    function takePosition(state, heroIdx, type, row, col) {
      switch (type) {
        case HT_BLOCK:
          state.board[row + 1][col + 1] = heroIdx + 1;
          break;
        case HT_VBAR:
          state.board[row + 1][col + 1] = heroIdx + 1;
          state.board[row + 2][col + 1] = heroIdx + 1;
          break;
        case HT_HBAR:
          state.board[row + 1][col + 1] = heroIdx + 1;
          state.board[row + 1][col + 2] = heroIdx + 1;
          break;
        case HT_BOX:
          state.board[row + 1][col + 1] = heroIdx + 1;
          state.board[row + 1][col + 2] = heroIdx + 1;
          state.board[row + 2][col + 1] = heroIdx + 1;
          state.board[row + 2][col + 2] = heroIdx + 1;
          break;
        default:
          break;
      }
    }

    function addGameStateHero(state, heroIdx, hero) {
      if (isPositionAvailable(state, hero.type, hero.row, hero.col)) {
        takePosition(state, heroIdx, hero.type, hero.row, hero.col);
        state.heroes.push(hero);
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

    function initHdrGameState(state, heroCount, heroInfo) {
      var i;
      initGameStateBoard(state);

      state.parent = null;
      state.step = 0;
      state.move.heroIdx = 0;
      state.move.dirIdx = 0;

      for (i = 0; i < heroCount; i++) {
        var hero = {
          type: heroInfo[i * 3],
          row: heroInfo[i * 3 + 1],
          col: heroInfo[i * 3 + 2],
        };

        if (!addGameStateHero(state, i, hero)) {
          return false;
        }
      }

      state.hash = getZobristHash(state);
      state.hashMirror = getMirrorZobristHash(state);

      return true;
    }

    function initHrdGame(game, start) {
      var i;

      game.result = 0;
      game.gameName = start.startName;

      for (i = 0; i < start.heroCount; i++) {
        game.heroNames.push(start.heroName[i]);
      }

      game.caoIdx = start.caoIdx;

      var state = {
        board: [],
        heroes: [],
        move: {
          heroIdx: 0,
          dirIdx: 0,
        },
        step: 0,
        hash: 0,
        hashMirror: 0,
        parent: null,
      };

      if (initHdrGameState(state, start.heroCount, start.heroInfo)) {
        game.states.push(state);
        return true;
      }

      return false;
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
      console.log('Find Result ', game.result, ' total ', gameState.step, ' steps');

      var state = gameState;
      while (state) {
        if (state.step > 0) {
          var curMove = state.move;
          var curDirection = directionStringFromIndex(curMove.dirIdx);
          console.log('Step ', state.step, ' : ', game.heroNames[curMove.heroIdx], ' move ', curDirection);
        }

        state = state.parent;
      }
    }

    function isEscaped(game, gameState) {
      var hero = gameState.heroes[game.caoIdx - 1];
      return hero.row === CAO_ESCAPE_ROW && hero.col === CAO_ESCAPE_COL;
    }

    function resolveGame(game) {
      var index = 0;

      while (index < game.states.length) {
        var gameState = game.states[index++];

        markGameState(game, gameState);

        if (isEscaped(game, gameState)) {
          game.result++;

          outputMoveRecords(game, gameState);
          break;
        } else {
          searchNewGameStates(game, gameState);
        }
      }

      return game.result > 0;
    }

    function searchNewGameStates(game, gameState) {
      var i, j;
      for (i = 0; i < gameState.heroes.length; i++) {
        for (j = 0; j < MAX_MOVE_DIRECTION; j++) {
          trySearchHeroNewState(game, gameState, i, j);
        }
      }
    }

    function trySearchHeroNewState(game, gameState, heroIdx, dirIdx) {
      var newState = moveHeroToNewState(game, gameState, heroIdx, dirIdx);

      if (newState) {
        if (addNewStatePattern(game, newState)) {
          tryHeroContinueMove(game, newState, heroIdx, dirIdx);
          return;
        }
      }
    }

    function moveHeroToNewState(game, gameState, heroIdx, dirIdx) {
      if (canHeroMove(gameState, heroIdx, dirIdx)) {
        var hash = getZobristHashUpdate(gameState, heroIdx, dirIdx);
        if (game.zhash[hash]) {
          return null;
        }

        var hashMirror = 0;
        if (NO_LR_MIRROR_ALLOW) {
          hashMirror = getZobristHashUpdate(gameState, heroIdx, dirIdx, true);
          if (game.zhash[hashMirror]) {
            return null;
          }
        }

        var newState = copyGameState(gameState);
        var hero = newState.heroes[heroIdx];
        var dir = directions[dirIdx];

        clearPosition(newState, hero.type, hero.row, hero.col);
        takePosition(newState, heroIdx, hero.type, hero.row + dir.y, hero.col + dir.x);

        hero.row = hero.row + dir.y;
        hero.col = hero.col + dir.x;

        newState.heroes[heroIdx] = hero;

        newState.step = gameState.step + 1;
        newState.parent = gameState;
        newState.move.heroIdx = heroIdx;
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
     * @param {Number} heroIdx
     * @param {Number} lastDirIdx
     */
    function tryHeroContinueMove(game, gameState, heroIdx, lastDirIdx) {
      var d, newState;
      for (d = 0; d < MAX_MOVE_DIRECTION; d++) {
        if (!isReverseDirection(d, lastDirIdx)) {
          newState = moveHeroToNewState(game, gameState, heroIdx, d);
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
     * @param {Object} start - Starting positions 
     */
    this.solve = function(start) {
      console.time('initialize');
      var game = {
        caoIdx: 0,
        gameName: '',
        heroNames: [],
        result: 0,
        states: [],
        zhash: {},
      };

      initZobristHash();

      if (initHrdGame(game, start)) {
        console.timeEnd('initialize');
        console.log('Find result for layout : ', game.gameName);
        console.time('solve');
        if (resolveGame(game)) {
          console.log('Find ', game.result, ' result(s) totally!');
        } else {
          console.log('Not find result for this layout!');
        }
        console.timeEnd('solve');
      }

      return 0;
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
