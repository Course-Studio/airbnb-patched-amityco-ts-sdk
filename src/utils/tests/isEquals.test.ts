import { isEqual } from '../isEqual';

describe('utils > isEqual', () => {
  describe('isEqual > primitive types', () => {
    test('it should return true if both objects are null', () => {
      expect(isEqual(null, null)).toBe(true);
    });

    test('it should return false if one of the object is undefined', () => {
      expect(isEqual(null, undefined)).toBe(false);
    });

    test('it should return false if x & y regexps that dont to the same instance', () => {
      expect(isEqual(/abc/, /abc/)).toBe(false);
    });

    test('it should return false if x & y are not the same regexps', () => {
      expect(isEqual(/abc/, /123/)).toBe(false);
    });

    test('it should return true if x & y are regexps with the same instance', () => {
      const regEx = /123/;
      expect(isEqual(regEx, regEx)).toBe(true);
    });

    test('it should return true if x & y are the same string', () => {
      expect(isEqual('test', 'test')).toBe(true);
    });

    test('it should return true if x & y are the same number', () => {
      expect(isEqual(5, 5)).toBe(true);
    });

    test('it should return false if x & y are not the same number', () => {
      expect(isEqual(5, 6)).toBe(false);
    });
  });

  describe('isEqual > complex types', () => {
    describe('- arrays', () => {
      test('it should return true if x & y are empty arrays', () => {
        expect(isEqual([], [])).toBe(true);
      });

      test('it should return true if x & y are the same array', () => {
        expect(isEqual([1, 'hi'], [1, 'hi'])).toBe(true);
      });

      test('it should return false if x & y are not the same array', () => {
        expect(isEqual([1, 'hi'], ['hi', 1])).toBe(false);
      });

      test('it should return false if x & y are only partially similar', () => {
        expect(isEqual([1, 'hi'], [1, 'hi', 'fail'])).toBe(false);
      });
    });

    describe('- objects', () => {
      test('it should return true if x & y are empty objects', () => {
        expect(isEqual({}, {})).toBe(true);
      });

      test('it should return true if x & y are the same object', () => {
        expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      });

      test('it should return false if x & y are the same nested object', () => {
        expect(
          isEqual(
            { 1: { name: 'mhc', age: 28 }, 2: { name: 'arb', age: 26 } },
            { 1: { name: 'mhc', age: 28 }, 2: { name: 'arb', age: 26 } },
          ),
        ).toBe(true);
      });

      test('it should return false if x & y are not the same nested object', () => {
        expect(
          isEqual(
            { 1: { name: 'mhc', age: 28 }, 2: { name: 'arb', age: 26 } },
            { 1: { name: 'mhc', age: 28 }, 2: { name: 'arb', age: 27 } },
          ),
        ).toBe(false);
      });
    });
  });
});
