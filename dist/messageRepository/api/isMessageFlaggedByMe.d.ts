/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const isReportedByMe = await MessageRepository.isMessageFlaggedByMe(messageId)
 * ```
 *
 * @param messageId of the message to check a report of.
 * @returns `true` if the report is created by me, `false` if doesn't.
 *
 * @category Report API
 * @async
 * */
export declare const isMessageFlaggedByMe: (messageId: Amity.Message['messageId']) => Promise<boolean>;
//# sourceMappingURL=isMessageFlaggedByMe.d.ts.map