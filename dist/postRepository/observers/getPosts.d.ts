/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 *
 * let posts = []
 * const unsub = PostRepository.getPosts({
 *   targetType: Amity.PostTargetType,
 *   targetId: Amity.Post['targetId'],
 * }, response => merge(posts, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Post} for a given target object
 *
 * @param params.targetType the type of the target
 * @param params.targetId the ID of the target
 * @param callback the function to call when new data are available
 * @param config
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Posts Live Collection
 */
export declare const getPosts: (params: Amity.PostLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Post>, config?: Amity.LiveCollectionConfig) => Amity.Unsubscriber;
//# sourceMappingURL=getPosts.d.ts.map