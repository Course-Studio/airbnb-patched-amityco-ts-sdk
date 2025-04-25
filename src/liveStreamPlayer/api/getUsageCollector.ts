import { UsageCollector } from '../utils/usageCollector';

let usageCollector: UsageCollector | null = null;

/**
 * Exposes methods to get the usage collector
 *
 * @memberof LiveStreamPlayer
 * @function getUsageCollector
 * @static
 *
 * @return {UsageCollector} usage collector
 *
 * @private
 */
export const getUsageCollector = (): UsageCollector => {
  if (usageCollector) {
    return usageCollector;
  }

  usageCollector = new UsageCollector();
  return usageCollector;
};
