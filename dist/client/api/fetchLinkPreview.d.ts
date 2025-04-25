/**
 * ```js
 * import { fetchLinkPreview } from '@amityco/ts-sdk'
 * const { title, description, imageUrl } = fetchLinkPreview('https://www.example.com/')
 * ```
 *
 *
 * @param url the url to fetch link preview
 * @returns A {@link Amity.LinkPreview} instance
 *
 * @category Client API
 * */
export declare const fetchLinkPreview: (url: string) => Promise<Amity.LinkPreview>;
