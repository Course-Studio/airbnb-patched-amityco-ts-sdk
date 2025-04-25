/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const success = await MessageRepository.markAsDelivered('subChannelId', 'messageId')
 * ```
 *
 * Update `deliveredToSegment` in  {@link Amity.SubChannelMarker}
 *
 * @param subChannelId the ID of the {@link Amity.SubChannel} of message
 * @param messageId the ID of the {@link Amity.Message} to mark delivered
 * @returns A success boolean if the {@link Amity.SubChannel} was updated
 *
 * @category Message API
 * @async
 */
export declare const markAsDelivered: (subChannelId: Amity.Message['subChannelId'], messageId: Amity.Message['messageId']) => Promise<boolean>;
//# sourceMappingURL=markAsDelivered.d.ts.map