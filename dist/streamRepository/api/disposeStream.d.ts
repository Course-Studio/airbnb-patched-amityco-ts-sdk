/**
 * ```js
 * import { disposeStream } from '@amityco/ts-sdk'
 * const stream = await disposeStream(streamId)
 * ```
 *
 * Dispose a {@link Amity.InternalStream}.
 * Streaming status will be updated to "ended" and streaming url will be invalidated
 *
 * @param streamId The {@link Amity.InternalStream} ID to dispose
 * @returns the associated {@link Amity.InternalStream} object
 *
 * @category Stream API
 * @async
 */
export declare const disposeStream: (streamId: Amity.InternalStream['streamId']) => Promise<Amity.Cached<Amity.InternalStream>>;
