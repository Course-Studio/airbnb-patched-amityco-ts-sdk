/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const unflagged = await PostRepository.unflagPost(postId)
 * ```
 *
 * @param postId of the post to unflag
 * @returns the unflag post result
 *
 * @category Post API
 * @async
 * */
export declare const unflagPost: (postId: Amity.Post['postId']) => Promise<boolean>;
//# sourceMappingURL=unflagPost.d.ts.map