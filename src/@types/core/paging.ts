export {};

declare global {
  namespace Amity {
    type PaginationStyles = 'skiplimit' | 'afterbefore' | 'afterbeforeraw';

    type PageLimit = {
      limit: number;
    };

    type PageAround = {
      around?: string;
    };

    type PrevPage<T extends number | string> = PageLimit & {
      after?: never;
      before?: T;
    } & PageAround;

    type NextPage<T extends number | string> = PageLimit & {
      after?: T;
      before?: never;
    } & PageAround;

    type Page<T extends number | string = number> = PrevPage<T> | NextPage<T>;

    /*
      updatedAt is here because if you need sort by updatedAt you
      need to include this data in query also
    */
    type PageRaw = (PrevPage<string> | NextPage<string>) & {
      updatedAt?: string;
    };

    type SkipLimitPagination = {
      skip?: number;
      limit?: number;
    };

    /*
      WARNING:
      in traditional "before/after" pagination, 'before' and 'after'
      normally should be strings representing the unique id of the
      resource. for some reason, our backend uses a number instead,
      bound to "channelSegment" (for message) and "segmentNumber" (
      for comments). so we have to cast this as number.
    */
    type AfterBeforePagination = {
      before?: number;
      after?: number;
      first?: number;
      last?: number;
    };

    type AfterBeforeRawPagination = PageRaw;

    type Pages<T extends Page | PageRaw> = {
      nextPage?: T;
      prevPage?: T;
    };

    type Paged<T, K extends Page | PageRaw = Page> = { data: T[] } & Pages<K>;

    type PageToken<T> = { data: T[] } & Amity.Pagination;
  }
}
