/**
 * ```js
 * import { FileRepository } from '@amityco/ts-sdk'
 * const created = await FileRepository.uploadImage(formData)
 * ```
 *
 * Creates an {@link Amity.File<'image'>}
 *
 * @param formData The data necessary to create a new {@link Amity.File<'image'>}
 * @param onProgress The callback to track the upload progress
 * @returns The newly created {@link Amity.File<'image'>}
 *
 * @category File API
 * @async
 */
export declare const uploadImage: (formData: FormData, onProgress?: (percent: number) => void) => Promise<Amity.Cached<Amity.File<"image">[]>>;
