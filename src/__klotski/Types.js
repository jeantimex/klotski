// @flow
export const HT_BLOCK = 1;
export const HT_VBAR = 2;
export const HT_HBAR = 3;
export const HT_BOX = 4;

const warriorTypes = {
  HT_BLOCK, // 1x1
  HT_VBAR, // 1x2
  HT_HBAR, // 2x1
  HT_BOX, // 2x2
};

export type WarriorType = $Values<typeof warriorTypes>;

export type Warrior = {
  type: WarriorType,
  row: number,
  col: number,
};

export type Direction = {
  x: number,
  y: number,
};

export type MoveAction = {
  heroIdx: number,
  dirIdx: number,
};

export type StartPosition = {
  startName: string,
  heroCount: number,
  caoIdx: number,
  heroName: Array<string>,
  heroInfo: Array<number>,
};

export type GameState = {
  board: Array<Array<number>>,
  heroes: Array<Warrior>,
  move: MoveAction,
  step: number,
  hash: number,
  hashMirror: number,
  parent: ?GameState,
};

export type Game = {
  gameName: string,
  heroNames: Array<string>,
  caoIdx: number,
  states: Array<?GameState>,
  zhash: Object,
  result: number,
};

export type CellState = {
  value: Array<number>,
};

export type ZobristHash = {
  key: Array<Array<CellState>>,
};
