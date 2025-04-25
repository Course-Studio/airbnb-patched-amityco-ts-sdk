/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const updated = await PostRepository.editPost(postId, {
 *   data: { text: 'hello world' }
 * })
 * ```
 *
 * Updates an {@link Amity.Post}
 *
 * @param postId The ID of the {@link Amity.Post} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Post} object
 *
 * @category Post API
 * @async
 */
export declare const editPost: <T extends Amity.PostContentType>(postId: Amity.Post["postId"], patch: Patch<Amity.Post, "data" | "metadata" | "mentionees" | "tags"> & {
    attachments?: {
        type: T;
        fileId: Amity.File["fileId"];
    }[];
}) => Promise<Amity.Cached<Amity.Post>>;
