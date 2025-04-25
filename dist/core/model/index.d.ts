export * from './idResolvers';
export * from './identifyModel';
/**
 * A map of v3 response keys to a store name.
 * @hidden
 */
export declare const PAYLOAD2MODEL: Record<string, Amity.Domain>;
/** hidden */
export declare const isOutdated: <T extends Amity.UpdatedAt>(prevData: T, nextData: T) => boolean;
/** hidden */
export declare function getFutureDate(date?: string | undefined): string;
/** hidden */
export declare function getPastDate(date?: string | undefined): string;
