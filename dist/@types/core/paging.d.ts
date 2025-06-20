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
        type PageRaw = (PrevPage<string> | NextPage<string>) & {
            updatedAt?: string;
        };
        type SkipLimitPagination = {
            skip?: number;
            limit?: number;
        };
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
        type Paged<T, K extends Page | PageRaw = Page> = {
            data: T[];
        } & Pages<K>;
        type PageToken<T> = {
            data: T[];
        } & Amity.Pagination;
    }
}
