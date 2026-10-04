// @ts-nocheck
import { expect, it, describe } from 'vitest';
import {
  getThreats,
  isCheck,
  isObject,
  deepCopy,
  deepMergeConfig,
  deepDiffConfig,
} from '@/helper/Board';
import {
  possibleFirstMovesWhite,
  possibleFirstThreatsWhite,
} from './helper/Constants';

describe.concurrent('Test getThreats', () => {
  it('calculate threats', async () => {
    const threats = getThreats(possibleFirstMovesWhite);
    expect(threats).toEqual(possibleFirstThreatsWhite);
  });
});

describe.concurrent('Test isCheck', () => {
  it('detects check for the side to move', async () => {
    expect(isCheck('4r1k1/8/8/8/8/8/8/4K3 w - - 0 1')).toBe(true);
    expect(isCheck('4r1k1/8/8/8/8/8/8/4K3 b - - 0 1')).toBe(false);
  });

  it('returns false for the starting position', async () => {
    expect(
      isCheck('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    ).toBe(false);
  });

  it('handles positions without kings', async () => {
    expect(isCheck('8/4p3/8/8/8/8/4P3/8 w - - 0 1')).toBe(false);
    // only the side to move has a king, which chess.js would reject
    expect(isCheck('4r3/8/8/8/8/8/8/4K3 w - - 0 1')).toBe(true);
  });
});

describe.concurrent('Test isObject', () => {
  it('returns a value', async () => {
    expect(isObject(0)).toBeDefined();
  });

  it.each([
    // test numbers
    { value: 0, result: false },
    { value: 1, result: false },
    { value: 1.123, result: false },
    // test strings
    { value: '', result: false },
    { value: 'foo', result: false },
    // test arrays
    { value: [], result: false },
    { value: [1, 2], result: false },
    { value: [{ foo: 'bar' }], result: false },
    // test functions
    { value: () => 'foo', result: false },
    { value: (bar) => ({ foo: bar }), result: false },
    // test booleans
    { value: false, result: false },
    { value: true, result: false },
    // test empty object
    { value: {}, result: true },
    // test singleton object
    { value: { foo: 'bar' }, result: true },
    // test object with multiple properties
    { value: { foo: 1, bar: false }, result: true },
    // test nested object
    { value: { foo: { foo: 0 }, bar: { bar: 1 } }, result: true },
    { value: Object.create(null), result: true },
    // test other objects, which are config values rather than config sections
    { value: null, result: false },
    { value: new Map([['e2', ['e4']]]), result: false },
    { value: new Date(0), result: false },
    { value: document.createElement('div'), result: false },
  ])('isObject($value) -> $result', ({ value, result }) => {
    expect(isObject(value)).toBe(result);
  });
});

describe.concurrent('Test deepCopy', () => {
  it('returns value', () => {
    expect(deepCopy({ a: 1 })).toBeDefined();
  });

  it('deep copies a singleton object', () => {
    const obj = { bar: 'foo' };
    const copy = deepCopy(obj);
    expect(copy).not.toBe(obj);
    expect(copy).toEqual(obj);
  });

  it('deep copies an object with multiple properties', () => {
    const obj = { a: 1, b: 2, c: 'foo', d: () => 'bar' };
    const copy = deepCopy(obj);
    expect(copy).not.toBe(obj);
    expect(copy).toEqual(obj);
  });

  it('deep copies an object with nested properties', () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3, d: 4 } } };
    const copy = deepCopy(obj);
    expect(copy).not.toBe(obj);
    expect(copy).toEqual(obj);

    expect(copy.b).not.toBe(obj.b);
    expect(copy.b).toEqual(obj.b);

    expect(copy.b.d).not.toBe(obj.b.d);
    expect(copy.b.d).toEqual(obj.b.d);
  });

  it('copies Maps and keeps other objects', () => {
    const dests = new Map([['e2', ['e3', 'e4']]]);
    const element = document.createElement('div');
    const copy = deepCopy({
      movable: { dests },
      addDimensionsCssVarsTo: element,
    });

    expect(copy.movable.dests).toBeInstanceOf(Map);
    expect(copy.movable.dests).not.toBe(dests);
    expect([...copy.movable.dests]).toEqual([...dests]);
    expect(copy.addDimensionsCssVarsTo).toBe(element);
  });
});

describe.concurrent('Test deepMergeConfig', () => {
  it('returns merge of source into target', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };
    const merge = deepMergeConfig(target, source);
    expect(merge).toEqual({ a: 1, b: 3 });
  });

  it('doesnt mutate arguments', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };
    deepMergeConfig(target, source);
    expect(target).toEqual({ a: 1, b: 2 });
    expect(source).toEqual({ b: 3 });
  });

  it('deep merges nested objects', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { a: 1, b: { d: { e: 3, d: 4 } } };
    const merge = deepMergeConfig(target, source);
    expect(merge).toEqual({ a: 1, b: { c: 2, d: { e: 3, d: 4 } } });
  });

  it('keeps Map values intact', () => {
    const target = { movable: { dests: new Map([['b1', ['a3', 'c3']]]) } };
    const source = { movable: { dests: new Map([['e2', ['e4']]]) } };
    const merge = deepMergeConfig(target, source);
    expect([...merge.movable.dests]).toEqual([['e2', ['e4']]]);
    expect([...target.movable.dests]).toEqual([['b1', ['a3', 'c3']]]);
  });
});

describe.concurrent('Test deepDiffConfig', () => {
  it('returns changes newConfig makes to oldConfig', () => {
    const oldConfig = { a: 1, b: 2 };
    const newConfig = { b: 3 };
    const diff = deepDiffConfig(oldConfig, newConfig);
    expect(diff).toEqual({ b: 3 });
  });

  it('doesnt mutate arguments', () => {
    const oldConfig = { a: 1, b: 2 };
    const newConfig = { b: 3 };
    deepDiffConfig(oldConfig, newConfig);
    expect(oldConfig).toEqual({ a: 1, b: 2 });
    expect(newConfig).toEqual({ b: 3 });
  });

  it('returns diff of nested configs', () => {
    const oldConfig = { a: 1, b: { c: 2 } };
    const newConfig = { a: 1, b: { d: { e: 3, d: 4 } } };
    const diff = deepDiffConfig(oldConfig, newConfig);
    expect(diff).toEqual({ b: { d: { e: 3, d: 4 } } });
  });

  it('compares Maps by their entries', () => {
    const e4 = ['e4'];
    const oldConfig = { movable: { dests: new Map([['e2', e4]]) } };

    expect(
      deepDiffConfig(oldConfig, { movable: { dests: new Map([['e2', e4]]) } })
    ).toEqual({});

    const changed = new Map([['d2', ['d4']]]);
    expect(deepDiffConfig(oldConfig, { movable: { dests: changed } })).toEqual({
      movable: { dests: changed },
    });
  });
});

export {};
