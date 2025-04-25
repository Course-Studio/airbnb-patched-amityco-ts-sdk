/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const isFlagged = await UserRepository.isUserFlaggedByMe(postId)
 * ```
 *
 * @param userId The ID of the thing to check a report to.
 * @returns `true` if the report is created by me, `false` if doesn't.
 *
 * @category Report API
 * @async
 * */
export declare const isUserFlaggedByMe: (userId: Amity.User['userId']) => Promise<boolean>;
