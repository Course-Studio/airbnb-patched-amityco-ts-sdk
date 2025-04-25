export declare function isObject(value: unknown): value is Record<string, unknown>;
/**
 *  convert all object getter property to static value
 */
export declare const convertGetterPropsToStatic: <T extends Record<string, unknown>>(obj: T) => T;
export declare const removeFunctionProperties: <T extends Record<string, unknown>>(obj: T) => T;
