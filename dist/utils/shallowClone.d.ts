/**
 * ```js
 * import { shallowClone } from '~/utils/shallowClone'
 * const newObj = shallowClone(obj)
 * ```
 *
 * Clone an object with same prototype and properties
 *
 * @param obj the object to clone
 * @returns new object with same prototype and properties
 *
 * @category utility
 * @private
 */
export declare function shallowClone(source: object, target: object): any;
