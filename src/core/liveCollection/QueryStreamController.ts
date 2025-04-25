export abstract class QueryStreamController<
  TQueryResponse extends ValueOf<Amity.Payloads>,
  TQueryParams,
> {
  protected query: Amity.LiveCollectionParams<TQueryParams>;

  protected cacheKey: string[];

  constructor(query: Amity.LiveCollectionParams<TQueryParams>, cacheKey: string[]) {
    this.query = query;
    this.cacheKey = cacheKey;
  }

  abstract saveToMainDB(response: TQueryResponse): Promise<void> | void;

  abstract appendToQueryStream(
    response: TQueryResponse & Amity.Pagination,
    direction: Amity.LiveCollectionPageDirection,
    refresh: boolean | undefined,
  ): void;
}
