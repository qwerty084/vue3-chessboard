import { expect, it, describe } from 'vitest';

import { getThreats } from '@/helper/Board';
import {
  possibleFirstMovesWhite,
  possibleFirstThreatsWhite,
} from './helper/Constants';

describe.concurrent('Test functions', () => {
  it('calculate threats', async () => {
    const threats = getThreats(possibleFirstMovesWhite);
    expect(threats).toEqual(possibleFirstThreatsWhite);
  });
});

export {};
