/**
 * Type guard to find if the a given decoded backend token uses "skip" pagination style
 *
 * @param json any json object as extracted from the backend
 * @returns success boolean if the token has either "skip" or "limit" props
 *
 * @hidden
 */
export declare const isSkip: (json: Record<string, unknown>) => json is Amity.SkipLimitPagination;
/**
 * Type guard to find if the a given decoded backend token uses "after/before" pagination style
 *
 * @param json any json object as extracted from the backend
 * @returns success boolean if the token has either "after" or "before" props
 *
 * @hidden
 */
export declare const isAfterBefore: (json: Record<string, unknown>) => json is Amity.AfterBeforePagination;
/**
 * Type guard to find if the a given decoded backend token uses v4 or newer "after/before" pagination style
 *
 * @param json any json object as extracted from the backend
 * @returns success boolean if the token has either "after" or "before" props
 *
 * @hidden
 */
export declare const isAfterBeforeRaw: (json: Record<string, unknown>) => json is Amity.AfterBeforeRawPagination;
/**
 * Type guard to find if the a given object is wrapped around Amity.Paged<>
 *
 * @param payload any object as passed from query functions
 * @returns success boolean if the object is an object shaped as { data: T[] } & Amity.Pages
 *
 * @hidden
 */
export declare const isPaged: <T extends unknown>(payload: any) => payload is Amity.Paged<T, any> & {
    paging?: Amity.Pagination["paging"];
};
/**
 * Converts a paging object into a b64 string token
 *
 * @param paging the sdk-friendly paging object
 * @param style the style of token to produce
 * @returns a backend's b64 encoded token
 *
 * @hidden
 */
export declare const toToken: (paging: Amity.Page | Amity.PageRaw | undefined, style: Amity.PaginationStyles) => Amity.Token | undefined;
/**
 * Converts a b64 string token into a paging object
 *
 * @param token the backend's b64 encoded token
 * @returns a sdk-friendly paging object
 *
 * @hidden
 */
export declare const toPage: (token?: Amity.Token) => Amity.Page | undefined;
/**
 * Converts a b64 string token into a paging object
 *
 * @param token the backend's b64 encoded token
 * @returns a sdk-friendly paging object
 *
 * @hidden
 */
export declare const toPageRaw: (token?: Amity.Token) => Amity.PageRaw | undefined;
