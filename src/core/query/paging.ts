import { decode, encode } from 'js-base64';

/**
 * Type guard to find if the a given decoded backend token uses "skip" pagination style
 *
 * @param json any json object as extracted from the backend
 * @returns success boolean if the token has either "skip" or "limit" props
 *
 * @hidden
 */
export const isSkip = (json: Record<string, unknown>): json is Amity.SkipLimitPagination =>
  ['skip'].some(prop => prop in json);

/**
 * Type guard to find if the a given decoded backend token uses "after/before" pagination style
 *
 * @param json any json object as extracted from the backend
 * @returns success boolean if the token has either "after" or "before" props
 *
 * @hidden
 */
export const isAfterBefore = (json: Record<string, unknown>): json is Amity.AfterBeforePagination =>
  ['after', 'before', 'first', 'last', 'limit'].some(prop => prop in json);

/**
 * Type guard to find if the a given decoded backend token uses v4 or newer "after/before" pagination style
 *
 * @param json any json object as extracted from the backend
 * @returns success boolean if the token has either "after" or "before" props
 *
 * @hidden
 */
export const isAfterBeforeRaw = (
  json: Record<string, unknown>,
): json is Amity.AfterBeforeRawPagination => 'limit' in json;

/**
 * Type guard to find if the a given object is wrapped around Amity.Paged<>
 *
 * @param payload any object as passed from query functions
 * @returns success boolean if the object is an object shaped as { data: T[] } & Amity.Pages
 *
 * @hidden
 */
export const isPaged = <T extends unknown>(
  payload: any,
): payload is Amity.Paged<T, any> & { paging?: Amity.Pagination['paging'] } => {
  return (
    payload?.hasOwnProperty('data') &&
    payload?.hasOwnProperty('nextPage') &&
    payload?.hasOwnProperty('prevPage')
  );
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
export const toToken = (
  paging: Amity.Page | Amity.PageRaw | undefined,
  style: Amity.PaginationStyles,
): Amity.Token | undefined => {
  if (!paging || !Object.keys(paging).length) return;

  let payload = {};

  // TODO: refactor this clean
  if (style === 'skiplimit') {
    payload = {
      skip: paging.after ?? 0,
      limit: paging.limit,
    };
  } else if (style === 'afterbefore' && isAfterBefore(paging)) {
    /*
      Caution: this testing style is only valid because
      our backend expects nothing else than a number as
      "before" or "after" value. if that would change,
      we'd need to move toward a more simple: `!paging.before`
    */
    if (paging?.before) {
      payload = {
        ...payload,
        before: paging.before,
      };
    }
    if (paging?.after) {
      payload = {
        ...payload,
        after: paging.after,
      };
    }
    if (!Number.isNaN(Number(paging?.limit))) {
      payload = {
        ...payload,
        limit: paging.limit,
      };
    }
  } else if (style === 'afterbeforeraw') {
    payload = paging;
  }

  // avoid sending {} as it seems backend flips when we do
  if (!Object.keys(payload).length) return;

  // don't try catch, let it throw
  return encode(JSON.stringify(payload));
};

/**
 * Converts a b64 string token into a paging object
 *
 * @param token the backend's b64 encoded token
 * @returns a sdk-friendly paging object
 *
 * @hidden
 */
export const toPage = (token?: Amity.Token): Amity.Page | undefined => {
  if (!token) return undefined;

  // don't try catch, let it throw
  const json = JSON.parse(decode(token));

  if (isSkip(json)) {
    return {
      after: json.skip,
      limit: json.limit!,
    } as Amity.NextPage<number>;
  }
  if (isAfterBefore(json)) {
    if ('before' in json) {
      return {
        before: json.before,
        limit: json.last,
      } as Amity.PrevPage<number>;
    }

    if ('after' in json) {
      return {
        after: json.after,
        limit: json.first,
      } as Amity.NextPage<number>;
    }
  }

  return undefined;
};

/**
 * Converts a b64 string token into a paging object
 *
 * @param token the backend's b64 encoded token
 * @returns a sdk-friendly paging object
 *
 * @hidden
 */
export const toPageRaw = (token?: Amity.Token): Amity.PageRaw | undefined => {
  if (!token) return undefined;

  // don't try catch, let it throw
  const json = JSON.parse(decode(token));

  if (isAfterBeforeRaw(json)) {
    return json as Amity.PageRaw;
  }

  return undefined;
};
