/**
 * ```js
 * import { getComments } from '@amityco/ts-sdk'
 *
 * let comments = []
 * const unsub = getComments({
 *   referenceType: Amity.InternalComment['referenceType'];
 *   referenceId: Amity.InternalComment['referenceId'];
 * }, response => merge(comments, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.InternalComment} for a given target object
 *
 * @param referenceType the type of the target
 * @param referenceId the ID of the target
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Comments Live Collection
 */
export declare const getComments: (params: Amity.CommentLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Comment>, config?: Amity.LiveCollectionConfig) => Amity.Unsubscriber;
