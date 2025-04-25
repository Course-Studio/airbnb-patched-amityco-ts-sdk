import { PaginationController } from './PaginationController';
import { PaginationNoPageController } from './PaginationNoPageController';
export declare abstract class LiveCollectionController<TPayloadDomain extends keyof Amity.Payloads, TQueryParams, TPublicPayload extends Record<string, unknown>, TPaginationController extends PaginationController<TPayloadDomain, TQueryParams> | PaginationNoPageController<TPayloadDomain, TQueryParams>> {
    protected paginationController: TPaginationController;
    protected queryStreamId: string;
    protected cacheKey: string[];
    protected callback: Amity.LiveCollectionCallback<TPublicPayload>;
    protected snapshot: TPublicPayload[] | undefined;
    constructor(paginationController: TPaginationController, queryStreamId: string, cacheKey: string[], callback: Amity.LiveCollectionCallback<TPublicPayload>);
    private refresh;
    protected loadPage({ initial, direction, }: {
        initial?: boolean;
        direction?: Amity.LiveCollectionPageDirection;
    }): void;
    protected abstract setup(): void;
    loadNextPage(): Promise<void>;
    loadPrevPage(): Promise<void>;
    protected abstract persistModel(response: Amity.Payloads[TPayloadDomain] & Partial<Amity.Pagination>): Promise<void> | void;
    protected abstract persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<TPayloadDomain>): void;
    abstract startSubscription(): Amity.Unsubscriber[];
    abstract notifyChange(params: Amity.LiveCollectionNotifyParams): void;
    protected shouldNotify(data: TPublicPayload[]): boolean;
    getCacheKey(): string[];
}
