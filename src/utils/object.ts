export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
/**
 *  convert all object getter property to static value
 */
export const convertGetterPropsToStatic = <T extends Record<string, unknown>>(obj: T): T => {
  if (!isObject(obj)) {
    return obj;
  }

  const entries = Object.entries(obj).map(([key, value]) => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (typeof descriptor?.get === 'function') {
      return [key, descriptor.get.call(obj)];
    }
    return [key, value];
  });

  return Object.fromEntries(entries);
};

export const removeFunctionProperties = <T extends Record<string, unknown>>(obj: T): T => {
  if (!isObject(obj)) {
    return obj;
  }

  const entries = Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'function') {
      return [key, undefined];
    }
    return [key, value];
  });

  return Object.fromEntries(entries);
};
