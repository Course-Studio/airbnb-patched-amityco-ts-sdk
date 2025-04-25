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
export declare const markAsReadBySegment: ({ subChannelId, readToSegment, }: {
    subChannelId: Amity.SubChannel["subChannelId"];
    readToSegment: number;
}) => Promise<boolean>;
