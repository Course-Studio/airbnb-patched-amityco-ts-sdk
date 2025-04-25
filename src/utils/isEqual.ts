/**
 * ```js
 * import { isEqual } from '~/utils/isEqual'
 * const isEqual = isEqual(post1, post2)
 * ```
 *
 * Compares two Amity.Model
 *
 * @param x the Amity.Model to compare
 * @param y the Amity.Model to compare wit x
 * @returns a boolean based on equality
 *
 * @category utility
 * @private
 */
export function isEqual(x: any, y: any): boolean {
  if (x === null || x === undefined || y === null || y === undefined) {
    return x === y;
  }

  // after this just checking type of one would be enough
  if (x.constructor !== y.constructor) {
    return false;
  }

  // if they are functions, they should exactly refer to same one (because of closures)
  if (x instanceof Function) {
    return x === y;
  }

  // if they are regexps, they should exactly refer to same one
  if (x instanceof RegExp) {
    return x === y;
  }

  if (x === y || x.valueOf() === y.valueOf()) {
    return true;
  }

  if (Array.isArray(x) && x.length !== y.length) {
    return false;
  }

  // check each element of the array for equality
  if (Array.isArray(x) && Array.isArray(y)) {
    if (x.length !== y.length) return false;

    for (let i = 0; i < x.length; i += 1) {
      if (!isEqual(x[i], y[i])) return false;
    }

    // if all elements are equal, the arrays are equal
    return true;
  }

  // if they are dates, they must had equal valueOf
  if (x instanceof Date) {
    return false;
  }

  // if they are strictly equal, they both need to be object at least
  if (!(x instanceof Object)) {
    return false;
  }

  if (!(y instanceof Object)) {
    return false;
  }

  // recursive object equality check
  const p = Object.keys(x);
  return (
    Object.keys(y).every(i => {
      // @ts-ignore
      return p.indexOf(i) !== -1;
    }) &&
    p.every(i => {
      return isEqual(x[i], y[i]);
    })
  );
}
