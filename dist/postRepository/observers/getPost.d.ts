/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk';
 *
 * let post;
 *
 * const unsub = PostRepository.getPost(postId, response => {
 *   post = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Post}
 *
 * @param postId the ID of the message to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the sub channel
 *
 * @category Post Live Object
 */
export declare const getPost: (postId: Amity.Post["postId"], callback: Amity.LiveObjectCallback<Amity.Post>) => Amity.Unsubscriber;
