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
export function shallowClone(source: object, target: object) {
  return Object.create(
    Object.getPrototypeOf(source), // Use the prototype of the source object
    {
      ...Object.getOwnPropertyDescriptors(source), // Copy all descriptors (methods, properties) from the source
      ...Object.getOwnPropertyDescriptors(target), // Merge/override with descriptors (getters, properties) from the target
    },
  );
}
