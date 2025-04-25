import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber, fireEvent } from '~/core/events';
import { dropFromCache, pullFromCache, queryCache, upsertInCache } from '~/cache/api';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { preparePostPayload } from '~/postRepository/utils/payload';

export const createPostEventSubscriber = (
  event: keyof Amity.MqttPostEvents,
  callback: Amity.Listener<Amity.InternalPost>,
) => {
  const client = getActiveClient();

  const filter = (payload: Amity.PostPayload) => {
    if (!client.cache) {
      callback(payload.posts[0]);
    } else {
      const data = preparePostPayload(payload);

      const { communities } = data;

      // NOTE: The event data should be merge with existing cache rather than replace it
      ingestInCache(data, undefined, false);

      if (communities?.[0] && !['post.updated'].includes(event)) {
        fireEvent('community.updated', {
          communities,
          categories: [],
          communityUsers: data.communityUsers,
          feeds: [],
          files: [],
          users: [],
        });
      }

      if (event === 'post.deleted') {
        const { postId, postedUserId } = payload.posts[0];

        try {
          isInTombstone('post', postId);
        } catch (e) {
          // Already in tombstone, skip to update client
          return;
        }

        // If this post NOT BELONG to current user, let **put it to tombstone in all cases**
        // For the case incoming post belong to current user, If from **different device will treat it as SOFT DELETE**
        // But for same device if it is soft delete it just need to handle as update cache
        // But if it is hard delete, it will pushed into tombstone before fire an event to BE. it means it will stay in tombstone already
        // and will got skip to notify in a previous code block
        if (postedUserId !== client.userId) {
          dropFromCache(['post', 'get', postId]);
        }

        return callback(payload.posts[0]);
      }

      const post = pullFromCache<Amity.InternalPost>(['post', 'get', payload.posts[0].postId])!;

      if (['post.created', 'post.approved', 'post.declined'].includes(event)) {
        let queries = queryCache(['post', 'query'])
          // @ts-ignore
          ?.filter(({ key }) => key[2]?.targetId === post.data.targetId);

        if (event === 'post.declined') {
          // @ts-ignore
          queries = queries?.filter(({ key }) => key[2]?.feedType === 'reviewing');
        }

        queries?.map(({ key, data }) => upsertInCache(key, data as any, { cachedAt: -1 }));
      }

      callback(post.data);
    }
  };

  return createEventSubscriber(client, event, event, filter);
};

export const createLocalPostEventSubscriber = (
  event: keyof Omit<Amity.LocalPostEvents, 'local.post.addReaction' | 'local.post.removeReaction'>,
  callback: Amity.Listener<Amity.InternalPost>,
) => {
  const client = getActiveClient();

  const filter = (payload: Amity.PostPayload) => {
    if (!client.cache) {
      callback(payload.posts[0]);
    } else {
      const data = preparePostPayload(payload);

      const { communities } = data;

      ingestInCache(data);

      if (communities?.[0] && !['local.post.updated'].includes(event)) {
        fireEvent('community.updated', {
          communities,
          categories: [],
          communityUsers: data.communityUsers,
          feeds: [],
          files: [],
          users: [],
        });
      }

      const post = pullFromCache<Amity.InternalPost>(['post', 'get', payload.posts[0].postId])!;

      callback(post.data);
    }
  };

  return createEventSubscriber(client, event, event, filter);
};
