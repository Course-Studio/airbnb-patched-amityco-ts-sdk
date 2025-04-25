/**
 *
 * Fired when any {@link Amity.Client} has a session state change
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Client Events
 */
export declare const onNetworkActivities: (callback: (request: Request, response: {
    data: unknown;
    status: number;
    statusText: string;
    headers: Headers;
}) => void) => Amity.Unsubscriber;
