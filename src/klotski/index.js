// @flow
import clone from 'clone';
import { HT_BLOCK, HT_VBAR, HT_HBAR, HT_BOX } from './Types';
import type {
  CellState,
  Direction,
  MoveAction,
  Game,
  GameState,
  StartPosition,
  Warrior,
  WarriorType,
  ZobristHash,
} from './Types';

const NO_LR_MIRROR_ALLOW: boolean = true;

const MAX_HERO_COUNT: number = 10;
const MAX_MOVE_DIRECTION: number = 4;
const MAX_WARRIOR_TYPE: number = 5;

const HRD_GAME_ROW: number = 5;
const HRD_GAME_COL: number = 4;
const HRD_BOARD_WIDTH: number = 6;
const HRD_BOARD_HEIGHT: number = 7;

const CAO_ESCAPE_ROW: number = 3; // row
const CAO_ESCAPE_COL: number = 1; // col

const BOARD_CELL_EMPTY: number = 0; // 0x00
const BOARD_CELL_BORDER: number = 15; // 0x0F

const DEBUG = false;

const directions: Array<Direction> = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }];
const directionName: Array<string> = ['Down', 'Right', 'Up', 'Left'];

let zob_hash: ZobristHash;

let count = 0;

let fileText = '';

let level = 0;

export default class Klotski {
  constructor() {}

  isReverseDirection(dirIdx1: number, dirIdx2: number): boolean {
    return (dirIdx1 + 2) % MAX_MOVE_DIRECTION === dirIdx2;
  }

  copyGameState(gameState: GameState): GameState {
    return JSON.parse(JSON.stringify(gameState));
  }

  directionStringFromIndex(dirIdx: number): string {
    //assert(dirIdx >= 0 && dirIdx < MAX_MOVE_DIRECTION);
    if (dirIdx >= 0 && dirIdx < MAX_MOVE_DIRECTION) {
      return directionName[dirIdx];
    }
    return '';
  }

  getHash(state: GameState): number {
    let hash: number = 0;
    const heroes: Array<Warrior> = state.heroes;
    let foundCaoCao: boolean = false;
    let c = 0;

    for (let i = 1; i <= HRD_GAME_ROW; i++) {
      for (let j = 1; j <= HRD_GAME_COL; j++) {
        const index = state.board[i][j] - 1;
        const type = index >= 0 && index < heroes.length ? heroes[index].type : 0;
        const pos = (i - 1) * HRD_GAME_COL + (j - 1);

        if (type === HT_BOX && !foundCaoCao) {
          foundCaoCao = true;
          hash += pos * Math.pow(2, 32);
        } else if (type !== HT_BOX) {
          hash += type * Math.pow(2, c++ * 2);
        }
      }
    }

    return hash;
  }

  getZobristHash(gameState: GameState): number {
    let hash: number = 0;
    const heroes = gameState.heroes;

    for (let i = 1; i <= HRD_GAME_ROW; i++) {
      for (let j = 1; j <= HRD_GAME_COL; j++) {
        const index = gameState.board[i][j] - 1;
        const type = index >= 0 && index < heroes.length ? heroes[index].type : 0;
        hash ^= zob_hash.key[i - 1][j - 1].value[type];
      }
    }

    return hash;
  }

  getMirrorZobristHash(gameState: GameState): number {
    let hash: number = 0;
    const heroes = gameState.heroes;

    for (let i = 1; i <= HRD_GAME_ROW; i++) {
      for (let j = 1; j <= HRD_GAME_COL; j++) {
        const index = gameState.board[i][j] - 1;
        const type = index >= 0 && index < heroes.length ? heroes[index].type : 0;
        hash ^= zob_hash.key[i - 1][HRD_GAME_COL - j].value[type];
      }
    }

    return hash;
  }

  getZobristHashUpdate(gameState: GameState, heroIdx: number, dirIdx: number, isMirror: boolean = false): number {
    let hash = isMirror ? gameState.hashMirror : gameState.hash;
    dirIdx = isMirror && dirIdx % 2 === 1 ? (dirIdx + 2) % 4 : dirIdx;

    const hero: Warrior = gameState.heroes[heroIdx];
    const dir: Direction = directions[dirIdx];
    const { x, y } = dir;
    const { row, type } = hero;
    const col = isMirror ? HRD_GAME_COL - 1 - hero.col : hero.col;
    const dx = isMirror ? -1 : 1;

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

  initZobristHash() {
    zob_hash = { key: [] };

    for (let i = 0; i < HRD_GAME_ROW; i++) {
      zob_hash.key[i] = [];

      for (let j = 0; j < HRD_GAME_COL; j++) {
        zob_hash.key[i][j] = { value: [] };
        this.makeCellState(zob_hash.key[i][j]);
      }
    }
  }

  makeCellState(cr: CellState) {
    for (let i = 0; i < MAX_WARRIOR_TYPE; i++) {
      cr.value[i] = this.random32();
    }
    if (DEBUG) {
      console.log(cr.value);
    }
  }

  random32(): number {
    let tmp = 0;

    do {
      tmp = Math.floor(Math.random() * Math.pow(2, 31));
    } while (!tmp);

    return tmp;
  }

  isPositionAvailable(state: GameState, type: WarriorType, row: number, col: number): boolean {
    let isOK: boolean = false;

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

    if (DEBUG) {
      console.log(isOK);
    }

    return isOK;
  }

  canHeroMove(state: GameState, heroIdx: number, dirIdx: number): boolean {
    let cv1, cv2, cv3, cv4;
    let canMove: boolean = false;
    const hero: Warrior = state.heroes[heroIdx];
    const dir: Direction = directions[dirIdx];

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

  clearPosition(state: GameState, type: WarriorType, row: number, col: number) {
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

  takePosition(state: GameState, heroIdx: number, type: WarriorType, row: number, col: number) {
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

  addGameStateHero(state: GameState, heroIdx: number, hero: Warrior): boolean {
    if (this.isPositionAvailable(state, hero.type, hero.row, hero.col)) {
      this.takePosition(state, heroIdx, hero.type, hero.row, hero.col);
      state.heroes.push(hero);
      return true;
    }
    return false;
  }

  initGameStateBoard(state: GameState) {
    let i, j;

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

  initHdrGameState(state: GameState, heroCount: number, heroInfo: Array<number>): boolean {
    this.initGameStateBoard(state);

    state.parent = null;
    state.step = 0;
    state.move.heroIdx = 0;
    state.move.dirIdx = 0;

    for (let i = 0; i < heroCount; i++) {
      const hero: Warrior = {
        type: heroInfo[i * 3],
        row: heroInfo[i * 3 + 1],
        col: heroInfo[i * 3 + 2],
      };

      if (!this.addGameStateHero(state, i, hero)) {
        return false;
      }
    }

    state.hash = this.getZobristHash(state);
    state.hashMirror = this.getMirrorZobristHash(state);

    return true;
  }

  initHrdGame(game: Game, start: StartPosition): boolean {
    game.result = 0;
    game.gameName = start.startName;

    for (let i = 0; i < start.heroCount; i++) {
      game.heroNames.push(start.heroName[i]);
    }

    game.caoIdx = start.caoIdx;

    const state = {
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

    if (this.initHdrGameState(state, start.heroCount, start.heroInfo)) {
      game.states.push(state);
      game.states.push(null);
      return true;
    }

    return false;
  }

  markGameState(game: Game, gameState: GameState) {
    //const l2rHash: number = this.getZobristHash(gameState);
    const l2rHash = gameState.hash;
    game.zhash[l2rHash] = true;

    if (NO_LR_MIRROR_ALLOW) {
      const r2lHash: number = gameState.hashMirror;
      game.zhash[r2lHash] = true;
    }
  }

  outputMoveRecords(game: Game, gameState: GameState) {
    console.log(`Find Result ${game.result} total ${gameState.step} steps`);

    let state: ?GameState = gameState;
    while (state) {
      if (state.step > 0) {
        const curMove: MoveAction = state.move;
        const curDirection: string = this.directionStringFromIndex(curMove.dirIdx);
        console.log(`Step ${state.step} : ${game.heroNames[curMove.heroIdx]} move ${curDirection}`);
      }

      state = state.parent;
    }
  }

  isEscaped(game: Game, gameState: GameState): boolean {
    const hero: Warrior = gameState.heroes[game.caoIdx - 1];
    return hero.row === CAO_ESCAPE_ROW && hero.col === CAO_ESCAPE_COL;
  }

  printGameState(gameState: GameState) {
    const hash = this.getZobristHash(gameState);

    if (DEBUG) {
      console.log(`[${level}] Game state hash : ${hash}`);
      console.log(gameState.board);
      console.log('------------------');
    }

    const heroes = gameState.heroes;
    let str = '';
    for (let i = 0; i < heroes.length; i++) {
      const hero: Warrior = heroes[i];
      str += `${hero.type}, ${hero.row}, ${hero.col},  `;
    }

    if (DEBUG) {
      console.log(str);
      console.log('------------------');
    }
  }

  resolveGame(game: Game): boolean {
    let index = 0;

    while (index < game.states.length) {
      const gameState: ?GameState = game.states[index++];

      if (gameState) {
        this.markGameState(game, gameState);

        if (this.isEscaped(game, gameState)) {
          game.result++;

          this.outputMoveRecords(game, gameState);
          break;
        } else {
          this.searchNewGameStates(game, gameState);
        }
      } else {
        level++;
        if (game.states.length > 0) {
          game.states.push(null);
        }
      }
    }

    return game.result > 0;
  }

  searchNewGameStates(game: Game, gameState: GameState) {
    for (let i = 0; i < gameState.heroes.length; i++) {
      for (let j = 0; j < MAX_MOVE_DIRECTION; j++) {
        this.trySearchHeroNewState(game, gameState, i, j);
      }
    }
  }

  trySearchHeroNewState(game: Game, gameState: GameState, heroIdx: number, dirIdx: number) {
    const newState: ?GameState = this.moveHeroToNewState(game, gameState, heroIdx, dirIdx);

    if (newState) {
      if (this.addNewStatePattern(game, newState)) {
        this.tryHeroContinueMove(game, newState, heroIdx, dirIdx);
        return;
      }
    }
  }

  moveHeroToNewState(game: Game, gameState: GameState, heroIdx: number, dirIdx: number): ?GameState {
    if (this.canHeroMove(gameState, heroIdx, dirIdx)) {
      const hash = this.getZobristHashUpdate(gameState, heroIdx, dirIdx);
      if (game.zhash[hash]) {
        return null;
      }

      let hashMirror: number = 0;
      if (NO_LR_MIRROR_ALLOW) {
        hashMirror = this.getZobristHashUpdate(gameState, heroIdx, dirIdx, true);
        if (game.zhash[hashMirror]) {
          return null;
        }
      }

      const newState: GameState = this.copyGameState(gameState);
      const hero: Warrior = newState.heroes[heroIdx];
      const dir: Direction = directions[dirIdx];

      this.clearPosition(newState, hero.type, hero.row, hero.col);
      this.takePosition(newState, heroIdx, hero.type, hero.row + dir.y, hero.col + dir.x);

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

  addNewStatePattern(game: Game, gameState: GameState): boolean {
    //const l2rHash: number = this.getZobristHash(gameState);
    const l2rHash: number = gameState.hash;
    let r2lHash: number = 0;

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

  tryHeroContinueMove(game: Game, gameState: GameState, heroIdx: number, lastDirIdx: number) {
    for (let d = 0; d < MAX_MOVE_DIRECTION; d++) {
      if (!this.isReverseDirection(d, lastDirIdx)) {
        const newState: ?GameState = this.moveHeroToNewState(game, gameState, heroIdx, d);
        if (newState) {
          if (this.addNewStatePattern(game, newState)) {
            newState.step--;
          } else {
            return;
          }
        }
      }
    }
  }

  releseGame(game: Game) {}

  solve(start: StartPosition): number {
    const game: Game = {
      gameName: '',
      heroNames: [],
      caoIdx: 0,
      states: [],
      zhash: {},
      result: 0,
    };

    this.initZobristHash();

    if (this.initHrdGame(game, start)) {
      console.log(`Find result for layout : ${game.gameName}`);

      if (this.resolveGame(game)) {
        console.log(`Find ${game.result} result(s) totally!`);
      } else {
        console.log(`Not find result for this layout!`);
      }

      this.releseGame(game);
    }

    return 0;
  }
}
