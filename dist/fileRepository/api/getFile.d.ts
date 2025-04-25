/**
 * ```js
 * import { getFile } from '@amityco/ts-sdk'
 * const file = await getFile('foo')
 * ```
 *
 * Fetches a {@link Amity.File} object
 *
 * @param fileId the ID of the {@link Amity.File} to fetch
 * @returns the associated {@link Amity.File} object
 *
 * @category File API
 * @async
 */
export declare const getFile: {
    <T extends Amity.FileType = any>(fileId: Amity.File<any>["fileId"]): Promise<Amity.Cached<Amity.File>>;
    locally(fileId: Amity.File<any>["fileId"]): Amity.Cached<Amity.File> | undefined;
};
