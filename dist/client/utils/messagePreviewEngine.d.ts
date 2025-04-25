/**
 * ```js
 * import { getMessagePreviewSetting } from '@amityco/ts-sdk'
 * const messagePreviewSetting = await getMessagePreviewSetting();
 * ```
 *
 * A util to getMessagePreviewSetting from cache or fetch from server
 * @returns A a {@link Amity.MessagePreviewSetting} enum
 *
 * @category private
 * @async
 */
export declare const getMessagePreviewSetting: (refresh?: boolean) => Promise<Amity.MessagePreviewSetting>;
/**
 * get messagePreviewSetting from cache and compare with new messagePreviewSetting
 * if new messagePreviewSetting is different from cache, check setting and update data in cache
 * @returns void
 *
 * @category private
 * @async
 */
export declare const initializeMessagePreviewSetting: () => Promise<void>;
//# sourceMappingURL=messagePreviewEngine.d.ts.map