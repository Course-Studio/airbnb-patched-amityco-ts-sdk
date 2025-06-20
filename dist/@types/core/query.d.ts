export {};
declare global {
    namespace Amity {
        type Cachable = {
            cachedAt: number;
        };
        type Local = {
            cachedAt: -1;
        };
        type AsyncFunc<Args extends any[], Returned extends any> = {
            (...args: Args): Promise<Returned>;
        };
        type FetcherFunc<Args extends any[], Returned extends any> = {
            (...args: Args): Promise<Returned>;
            locally: (...args: Args) => Returned | undefined;
        };
        type MutatorFunc<Args extends any[], Returned extends any> = {
            (...args: Args): Promise<Returned>;
            optimistically: (...args: Args) => Returned | undefined;
        };
        type OfflineFunc<Args extends any[], Returned extends any> = FetcherFunc<Args, Returned> | MutatorFunc<Args, Returned>;
        type Query<Args extends any[], Returned extends any> = {
            func: AsyncFunc<Args, Returned> | OfflineFunc<Args, Returned>;
            args: Args;
        };
        type QueryPolicy = 'cache_only' | 'cache_then_server' | 'no_fetch';
        type QueryOptions = {
            lifeSpan: number;
        };
        type SnapshotOptions = {
            origin: 'local' | 'server' | 'event';
            loading: boolean;
            error?: any;
        };
        type Snapshot<T> = (T extends Amity.Cached<infer T2> ? T2 extends Amity.Paged<infer T3, infer T4> ? {
            data: T3[] | undefined;
        } & Amity.Pages<T4> & {
            paging?: Amity.Pagination['paging'];
        } & {
            cachedAt?: Amity.CacheOptions['cachedAt'];
        } : {
            data: T2;
        } & {
            cachedAt?: Amity.CacheOptions['cachedAt'];
        } : T extends Amity.Paged<infer T3, infer T4> ? {
            data: T3[] | undefined;
        } & Amity.Pages<T4> & {
            paging?: Amity.Pagination['paging'];
        } : {
            data: T | undefined;
        }) & SnapshotOptions;
        type RunQueryOptions<T> = T extends Amity.AsyncFunc<infer Args, infer Returned> ? Omit<Amity.Snapshot<Returned>, 'data'> : never;
    }
}
