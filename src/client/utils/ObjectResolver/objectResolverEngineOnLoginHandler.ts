import { onSessionStateChange } from '~/client/events/onSessionStateChange';
import ObjectResolverEngine from './objectResolverEngine';

export default () => {
  const objectResolverEngine = ObjectResolverEngine.getInstance();
  objectResolverEngine.startResolver();

  onSessionStateChange(state => {
    if (state === Amity.SessionStates.ESTABLISHED) {
      objectResolverEngine.onSessionEstablished();
    } else if (state === Amity.SessionStates.TOKEN_EXPIRED) {
      objectResolverEngine.onTokenExpired();
    } else {
      objectResolverEngine.onSessionDestroyed();
    }
  });

  return () => {
    objectResolverEngine.onSessionDestroyed();
  };
};
