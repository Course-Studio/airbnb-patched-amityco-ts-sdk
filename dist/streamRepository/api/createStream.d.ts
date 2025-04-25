/**
 * ```js
 * import { createStream } from '@amityco/ts-sdk'
 * const created = await createStream({ title: 'my stream', 'thumbnailFileId': fileId  })
 * ```
 *
 * Creates an {@link Amity.InternalStream}
 *
 * @param bundle The data necessary to create a new {@link Amity.InternalStream}
 * @returns The newly created {@link Amity.InternalStream}
 *
 * @category Stream API
 * @async
 */
export declare const createStream: (bundle: Pick<Amity.InternalStream, 'title' | 'thumbnailFileId' | 'description'> & {
    isSecure?: boolean;
}) => Promise<Amity.Cached<Amity.Stream>>;
//# sourceMappingURL=createStream.d.ts.map