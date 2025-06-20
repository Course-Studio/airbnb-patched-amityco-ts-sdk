import { identifyModelKey } from '~/core/model';
import { isEqual } from '~/utils/isEqual';

export function hasMention(model: Amity.Mentionable<'user' | 'channel'>, userId: string) {
  const channelMention = model?.mentionees?.find(x => x.type === 'channel') as Amity.ChannelMention;

  if (channelMention) {
    return true;
  }

  const userMention = model?.mentionees?.find(x => x.type === 'user') as Amity.UserMention;

  if (userMention) {
    return userMention.userIds.includes(userId);
  }

  return false;
}

export function shouldDispatchCollection<T extends Amity.Models[Amity.Domain] & Amity.UpdatedAt>(
  collection: T[],
  newItem: T,
  action: 'onCreate' | string,
): boolean {
  const key = identifyModelKey(newItem);
  // @ts-ignore
  const item = collection.find(x => x[key] === newItem[key]);

  if (item) {
    return !isEqual(item, newItem);
  }

  return action === 'onCreate';
}

export function merge<T extends Amity.Models[Amity.Domain]>(
  collection1: T[],
  collection2: T[],
): T[] {
  const temp = [...collection1, ...collection2];

  if (temp.length === 0) {
    return [];
  }

  const key = identifyModelKey(temp[0]);
  const map = new Map<string, T>();

  // @ts-ignore
  temp.forEach(x => map.set(x[key], x));

  return Array.from(map.values());
}

export function isNonNullable<TValue>(value: TValue | undefined | null): value is TValue {
  return value != null;
}
