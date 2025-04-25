/**
 * ```js
 * import { getStreams } from '@amityco/ts-sdk'
 * const streams = await getStreams()
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalStream} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalStream} objects
 *
 * @category Stream API
 * @async
 */
export declare const queryStreams: (query?: Amity.QueryStreams) => Promise<Amity.Cached<Amity.PageToken<Amity.InternalStream>>>;
