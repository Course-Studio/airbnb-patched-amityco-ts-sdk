/**
 * Finds the name of the store for a given unknown model
 *
 * @param model one of the {@link Amity.Models} to identify
 * @returns the name of the corresponding store
 */
export declare const identifyModel: (model: Record<string, unknown>) => keyof Amity.Models;
export declare const identifyModelKey: (model: Record<string, unknown>) => string | undefined;
