/**
 * @deprecated This function will to be deprecated soon.
 */
export declare const liveObject: <T extends Amity.Model, K extends keyof T, CallbackData extends unknown = any>(id: T[K], callback: Amity.LiveObjectCallback<CallbackData>, key: K, fetcher: (id: T[K]) => Promise<Amity.Cached<T>>, eventHandlers: ((callback: Amity.Listener<T>) => Amity.Unsubscriber)[], options?: Amity.LiveObjectOptions<T, CallbackData> | undefined) => Amity.Unsubscriber;
//# sourceMappingURL=liveObject.d.ts.map