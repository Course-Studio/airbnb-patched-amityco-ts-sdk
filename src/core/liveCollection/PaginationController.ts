import { AxiosInstance } from 'axios';
import { getActiveClient } from '~/client/api';

export abstract class PaginationController<
  TPayloadDomain extends keyof Amity.Payloads,
  TQueryParams,
> {
  private queryParams: Amity.LiveCollectionParams<TQueryParams>;

  protected http: AxiosInstance;

  private previousToken: string | undefined;

  private nextToken: string | undefined;

  constructor(queryParams: Amity.LiveCollectionParams<TQueryParams>) {
    const { http } = getActiveClient();

    this.queryParams = queryParams;
    this.http = http;
  }

  loadFirstPage(): Promise<(Amity.Payloads[TPayloadDomain] & Amity.Pagination) | undefined> {
    return this.onFetch(Amity.LiveCollectionPageDirection.FIRST);
  }

  loadNextPage(): Promise<(Amity.Payloads[TPayloadDomain] & Amity.Pagination) | undefined> {
    return this.onFetch(Amity.LiveCollectionPageDirection.NEXT);
  }

  loadPreviousPage(): Promise<(Amity.Payloads[TPayloadDomain] & Amity.Pagination) | undefined> {
    return this.onFetch(Amity.LiveCollectionPageDirection.PREV);
  }

  async onFetch(
    direction: Amity.LiveCollectionPageDirection = Amity.LiveCollectionPageDirection.FIRST,
  ) {
    if (direction === 'prev' && !this.previousToken) return;
    if (direction === 'next' && !this.nextToken) return;

    let token: string | undefined;

    if (direction === 'prev') token = this.previousToken;
    if (direction === 'next') token = this.nextToken;

    const queryResponse = await this.getRequest(this.queryParams, token);

    if (direction === 'first') {
      this.nextToken = queryResponse.paging?.next;
      this.previousToken = queryResponse.paging?.previous;
    }

    if (direction === 'prev') this.previousToken = queryResponse.paging?.previous;
    if (direction === 'next') this.nextToken = queryResponse.paging?.next;

    return queryResponse;
  }

  abstract getRequest(
    queryParams: TQueryParams,
    token: string | undefined,
  ): Promise<Amity.Payloads[TPayloadDomain] & Amity.Pagination>;

  getNextToken(): string | undefined {
    return this.nextToken;
  }

  getPrevToken(): string | undefined {
    return this.previousToken;
  }
}
