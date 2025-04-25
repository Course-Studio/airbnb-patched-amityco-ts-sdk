import { AxiosInstance } from 'axios';
import { getActiveClient } from '~/client/api';

export abstract class PaginationNoPageController<
  TPayloadDomain extends keyof Amity.Payloads,
  TQueryParams,
> {
  private queryParams: TQueryParams;

  protected http: AxiosInstance;

  constructor(queryParams: TQueryParams) {
    const { http } = getActiveClient();

    this.queryParams = queryParams;
    this.http = http;
  }

  async onFetch() {
    const queryResponse = await this.getRequest(this.queryParams);

    return queryResponse;
  }

  abstract getRequest(queryParams: TQueryParams): Promise<Amity.Payloads[TPayloadDomain]>;
}
