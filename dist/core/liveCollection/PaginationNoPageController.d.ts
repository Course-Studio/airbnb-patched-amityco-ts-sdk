import { AxiosInstance } from 'axios';
export declare abstract class PaginationNoPageController<TPayloadDomain extends keyof Amity.Payloads, TQueryParams> {
    private queryParams;
    protected http: AxiosInstance;
    constructor(queryParams: TQueryParams);
    onFetch(): Promise<Amity.Payloads[TPayloadDomain]>;
    abstract getRequest(queryParams: TQueryParams): Promise<Amity.Payloads[TPayloadDomain]>;
}
//# sourceMappingURL=PaginationNoPageController.d.ts.map