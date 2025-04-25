export {};
declare global {
    namespace Amity {
        type LiveObject<T extends any> = {
            data: T;
            error?: any;
            loading: boolean;
            origin?: 'local' | 'server' | 'event';
        };
        type LiveObjectCallback<T extends any> = Amity.Listener<LiveObject<T>>;
        type LiveObjectOptions<T extends Amity.Models[Amity.Domain], CallbackData extends any = any> = {
            forceDispatch?: boolean;
            callbackDataSelector?: (data: T) => CallbackData;
            callbackFilter?: (currentModel: T, previousModel: T) => boolean;
        };
        type LiveCollection<T extends any> = LiveObject<T[]> & {
            onNextPage?: () => void;
            hasNextPage?: boolean;
            onPrevPage?: () => void;
            hasPrevPage?: boolean;
        };
        type LiveCollectionCallback<T extends any> = Amity.Listener<LiveCollection<T>>;
        type LiveCollectionConfig = {
            policy?: Exclude<Amity.QueryPolicy, 'no_fetch'>;
        };
        type LiveCollectionParams<T extends any> = T & {
            limit?: number;
        };
        type LiveCollectionCache<T extends any, U extends any> = Pick<LiveCollection<T>, 'data' | 'error' | 'loading'> & {
            params: U;
        } & {
            query?: Omit<Amity.QueryMessages, 'page'>;
        };
        const enum LiveDataOrigin {
            LOCAL = "local",
            SERVER = "server",
            EVENT = "event"
        }
        type LiveCollectionNotifyParams = {
            origin?: LiveDataOrigin;
            loading: boolean;
            error?: unknown;
        };
        const enum LiveCollectionPageDirection {
            FIRST = "first",
            PREV = "prev",
            NEXT = "next"
        }
        type LiveCollectionPersistQueryStreamParams<T extends keyof Amity.Payloads> = {
            response: Amity.Payloads[T] & Partial<Amity.Pagination>;
            direction: LiveCollectionPageDirection;
            refresh?: boolean;
        };
    }
}
//# sourceMappingURL=live.d.ts.map