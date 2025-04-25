import { inferIsDeleted } from '../inferIsDeleted';

describe('utils > inferIsDeleted', () => {
  test('it should return false if includeDeleted false', () => {
    expect(inferIsDeleted(false)).toBe(false);
  });

  test('it should return false if includeDeleted undefined', () => {
    expect(inferIsDeleted(undefined)).toBe(false);
  });

  test('it should return undefined if includeDeleted true', () => {
    expect(inferIsDeleted(true)).toBeUndefined();
  });
});
