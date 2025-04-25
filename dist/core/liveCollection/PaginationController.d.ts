import { AxiosInstance } from 'axios';
export declare abstract class PaginationController<TPayloadDomain extends keyof Amity.Payloads, TQueryParams> {
    private queryParams;
    protected http: AxiosInstance;
    private previousToken;
    private nextToken;
    constructor(queryParams: Amity.LiveCollectionParams<TQueryParams>);
    loadFirstPage(): Promise<(Amity.Payloads[TPayloadDomain] & Amity.Pagination) | undefined>;
    loadNextPage(): Promise<(Amity.Payloads[TPayloadDomain] & Amity.Pagination) | undefined>;
    loadPreviousPage(): Promise<(Amity.Payloads[TPayloadDomain] & Amity.Pagination) | undefined>;
    onFetch(direction?: Amity.LiveCollectionPageDirection): Promise<(Amity.Payloads[TPayloadDomain] & Amity.Pagination) | undefined>;
    abstract getRequest(queryParams: TQueryParams, token: string | undefined): Promise<Amity.Payloads[TPayloadDomain] & Amity.Pagination>;
    getNextToken(): string | undefined;
    getPrevToken(): string | undefined;
}
//# sourceMappingURL=PaginationController.d.ts.map