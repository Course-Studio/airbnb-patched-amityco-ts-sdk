import { pullFromCache } from '~/cache/api';

export const categoryLinkedObject = (category: Amity.InternalCategory): Amity.Category => {
  return {
    ...category,
    get avatar(): Amity.File<'image'> | undefined {
      if (!category.avatarFileId) return undefined;

      const avatar = pullFromCache<Amity.File<'image'>>([
        'file',
        'get',
        `${category.avatarFileId}`,
      ])?.data;

      return avatar;
    },
  };
};
