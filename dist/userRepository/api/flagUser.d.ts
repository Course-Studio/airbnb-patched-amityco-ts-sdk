/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const flagged = await UserRepository.flagUser('userId')
 * ```
 *
 * @param userId The ID of the user to add a be flagged
 * @returns the created report result
 *
 * @category User API
 * @async
 * */
export declare const flagUser: (userId: Amity.User["userId"]) => Promise<boolean>;
