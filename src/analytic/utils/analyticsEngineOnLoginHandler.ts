import { onSessionStateChange } from '~/client/events/onSessionStateChange';
import AnalyticsEngine from '../service/analytic/AnalyticsEngine';

export default () => {
  const analyticsEngine = AnalyticsEngine.getInstance();
  analyticsEngine.established();

  onSessionStateChange(state => {
    if (state === Amity.SessionStates.ESTABLISHED) {
      analyticsEngine.established();
    } else {
      analyticsEngine.handleTokenExpired();
    }
  });

  return () => {
    analyticsEngine.destroy();
  };
};
