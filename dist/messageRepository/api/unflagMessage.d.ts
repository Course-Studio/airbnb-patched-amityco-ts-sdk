/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const unflagged = await MessageRepository.unflag(messageId)
 * ```
 *
 * @param messageId of the message to unflag
 * @returns boolean to indicate success
 *
 * @category Report API
 * @async
 * */
export declare const unflagMessage: (messageId: Amity.Message['messageId']) => Promise<boolean>;
