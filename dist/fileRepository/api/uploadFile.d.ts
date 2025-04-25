/**
 * ```js
 * import { FileRepository } from '@amityco/ts-sdk'
 * const created = await FileRepository.uploadFile(formData)
 * ```
 *
 * Creates an {@link Amity.File}
 *
 * @param formData The data necessary to create a new {@link Amity.File}
 * @param onProgress The callback to track the upload progress
 * @returns The newly created {@link Amity.File}
 *
 * @category File API
 * @async
 */
export declare const uploadFile: <T extends Amity.FileType = any>(formData: FormData, onProgress?: (percent: number) => void) => Promise<Amity.Cached<Amity.File[]>>;
