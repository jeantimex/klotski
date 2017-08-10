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
