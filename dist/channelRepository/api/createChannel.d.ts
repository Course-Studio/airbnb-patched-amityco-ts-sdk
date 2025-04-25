/**
 * ```js
 * import { createChannel } from '@amityco/ts-sdk'
 * const created = await createChannel({ displayName: 'foobar' })
 * ```
 *
 * Creates an {@link Amity.Channel}
 *
 * @param bundle The data necessary to create a new {@link Amity.Channel}
 * @returns The newly created {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export declare const createChannel: <T extends Amity.ChannelType>(bundle: {
    type: T;
    userIds?: Amity.InternalUser['userId'][];
} & Pick<Amity.Channel<T>, "displayName" | "avatarFileId" | "isPublic" | "metadata" | "tags">) => Promise<Amity.Cached<Amity.InternalChannel>>;
