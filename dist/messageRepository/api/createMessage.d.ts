declare type createMessageParam<T extends Amity.MessageContentType> = Pick<Amity.Message<T>, 'subChannelId' | 'parentId' | 'dataType' | 'tags' | 'metadata' | 'mentionees'> & {
    data?: Amity.Message<T>['data'];
    fileId?: Amity.File['fileId'];
    referenceId?: string;
};
/**
 * ```js
 * import { createMessage, createQuery, runQuery } from '@amityco/ts-sdk'
 *
 * const query = createQuery(createMessage, {
 *   subChannelId: 'foobar',
 *   data: { text: 'hello world' },
 * });
 *
 * runQuery(query, ({ data: message, loading }) => {
 *   console.log(message);
 * });
 * ```
 *
 * Creates an {@link Amity.Message}
 *
 * @param bundle The data necessary to create a new {@link Amity.Message}
 * @returns The newly created {@link Amity.Message}
 *
 * @category Message API
 * @async
 */
export declare const createMessage: <T extends Amity.MessageContentType>(bundle: createMessageParam<T>) => Promise<Amity.Cached<Amity.Message>>;
export {};
//# sourceMappingURL=createMessage.d.ts.map