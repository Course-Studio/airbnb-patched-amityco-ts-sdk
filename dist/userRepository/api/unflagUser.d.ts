/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const unflagged = await UserRepository.unflagUser('post', postId)
 * ```
 *
 * @param userId The ID of the user to unflag
 * @returns the deleted report result
 *
 * @category User API
 * @async
 * */
export declare const unflagUser: (userId: Amity.User['userId']) => Promise<boolean>;
