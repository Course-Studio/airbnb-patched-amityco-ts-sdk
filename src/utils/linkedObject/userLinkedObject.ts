import { pullFromCache } from '~/cache/api/pullFromCache';

export const userLinkedObject = (user: Amity.InternalUser): Amity.User => {
  return {
    ...user,
    get avatar(): Amity.File<'image'> | undefined {
      if (!user.avatarFileId) return undefined;
      const avatar = pullFromCache<Amity.File<'image'>>([
        'file',
        'get',
        `${user.avatarFileId}`,
      ])?.data;

      return avatar;
    },
  };
};
