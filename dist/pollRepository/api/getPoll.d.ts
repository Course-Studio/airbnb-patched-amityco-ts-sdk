/**
 * ```js
 * import { getPoll } from '@amityco/ts-sdk'
 * const poll = await getPoll('foobar')
 * ```
 *
 * Fetches a {@link Amity.Poll} object
 *
 * @param pollId the ID of the {@link Amity.Poll} to fetch
 * @returns the associated {@link Amity.Poll} object
 *
 * @category Poll API
 * @async
 */
export declare const getPoll: {
    (pollId: Amity.Poll["pollId"]): Promise<Amity.Cached<Amity.Poll>>;
    locally(pollId: Amity.Poll["pollId"]): Amity.Cached<Amity.Poll> | undefined;
};
