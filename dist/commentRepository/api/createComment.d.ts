/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const newComment = await CommentRepository.createComment(bundle)
 * ```
 *
 * Creates an {@link Amity.Comment}
 *
 * @param bundle The data necessary to create a new {@link Amity.Comment}
 * @returns The newly created {@link Amity.Comment}
 *
 * @category Comment API
 * @async
 */
export declare const createComment: (bundle: Pick<Amity.Comment<Amity.CommentContentType>, "data" | "referenceType" | "referenceId" | "parentId" | "metadata" | "mentionees" | "attachments">) => Promise<Amity.Cached<Amity.Comment>>;
