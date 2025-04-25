/**
 *
 * Mark subChannel as read by readToSegment
 *
 * @param subChannelIds the IDs of the {@link Amity.SubChannel} to update
 * @param readToSegment the segment to mark as read
 * @returns a success boolean if the {@link Amity.SubChannel} was updated
 *
 * @category Channel API
 * @async
 */
export declare const markChannelsAsReadBySegment: (readings: {
    channelId: Amity.Channel['channelId'];
    readToSegment: number;
}[]) => Promise<boolean>;
//# sourceMappingURL=markChannelsAsReadBySegment.d.ts.map