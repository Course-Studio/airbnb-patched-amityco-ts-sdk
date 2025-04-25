/**
 * ```js
 * import { StoryRepository } from '@amityco/js-sdk';
 * let storiesData;
 *
 * const unsubscribe = StoryRepository.getActiveStoriesByTarget({ targetId, targetType }, response => {
 *  storiesData = response.data;
 * });
 *
 * unsubscribe();
 * ```
 *
 * Observe all mutations on a given {@link Amity.Story}
 *
 * @param params for querying stories from a community
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the story
 *
 * @category SubChannel Live Object
 */
export declare const getActiveStoriesByTarget: (params: Amity.GetStoriesByTargetParam, callback: Amity.LiveCollectionCallback<Amity.Story | undefined>) => () => void;
//# sourceMappingURL=getActiveStoriesByTarget.d.ts.map