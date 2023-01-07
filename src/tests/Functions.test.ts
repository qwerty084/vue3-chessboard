import { expect, it, describe } from 'vitest';

import { getPossiblePromotions, getThreats } from '@/helper/Board';
import {
  moves,
  possibleFirstMovesWhite,
  possibleFirstThreatsWhite,
} from './helper/Constants';

describe.concurrent('Test functions', () => {
  it('calculate threats', async () => {
    const threats = getThreats(possibleFirstMovesWhite);
    expect(threats).toEqual(possibleFirstThreatsWhite);
  });

  it('calculatePromotions', async () => {
    const promotions = getPossiblePromotions(moves);
    expect(promotions).toHaveLength(4);
  });
});

export {};
