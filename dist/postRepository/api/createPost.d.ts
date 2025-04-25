/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const created = await PostRepository.createPost({
 *   targetType: 'user',
 *   targetId: 'foobar',
 *   data: { text: 'hello world' }
 * }))
 * ```
 *
 * Creates an {@link Amity.Post}
 *
 * @param bundle The data necessary to create a new {@link Amity.Post}
 * @returns The newly created {@link Amity.Post}
 *
 * @category Post API
 * @async
 */
export declare const createPost: <T extends string>(bundle: Pick<Amity.Post<T>, "targetType" | "targetId"> & Partial<Pick<Amity.Post<T>, "metadata" | "tags" | "mentionees">> & {
    dataType?: T | undefined;
    data?: {
        [k: string]: any;
    } | undefined;
    attachments?: {
        type: T;
        fileId: Amity.File['fileId'];
    }[] | undefined;
}) => Promise<Amity.Cached<Amity.Post>>;
//# sourceMappingURL=createPost.d.ts.map