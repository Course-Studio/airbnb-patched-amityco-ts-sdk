/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const flagged = await MessageRepository.flagMessage(messageId)
 * ```
 *
 * @param messageId of the message to flag
 * @returns the created report result
 *
 * @category Message API
 * @async
 * */
export declare const flagMessage: (messageId: Amity.Message['messageId']) => Promise<boolean>;
