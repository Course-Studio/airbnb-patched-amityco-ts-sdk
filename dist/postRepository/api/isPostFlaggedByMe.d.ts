/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const isReported = await PostRepository.isPostFlaggedByMe('post', postId)
 * ```
 *
 * @param postId of the post to check if flagged by current user
 * @returns `true` if the post is flagged by me, `false` if doesn't.
 *
 * @category Post API
 * @async
 * */
export declare const isPostFlaggedByMe: (postId: Amity.Post["postId"]) => Promise<boolean>;
