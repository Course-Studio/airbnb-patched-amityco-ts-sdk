/**
 * ```js
 * import { getCategories } from '@amityco/ts-sdk'
 *
 * let categories = []
 * const unsub = getCategories({}, response => merge(categories, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Category}s
 *
 * @param params for querying categories
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the categories
 *
 * @category Category Live Collection
 */
export declare const getCategories: (params: Amity.CategoryLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Category>, config?: Amity.LiveCollectionConfig) => () => void;
//# sourceMappingURL=getCategories.d.ts.map