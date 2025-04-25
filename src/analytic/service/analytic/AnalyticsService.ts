import AnalyticsEngine from './AnalyticsEngine';

class AnalyticsService {
  private analyticEngine;

  constructor() {
    this.analyticEngine = AnalyticsEngine.getInstance();
  }

  markPostAsViewed(postId: string): void {
    this.analyticEngine.markPostAsViewed(postId);
  }
}

let instance: AnalyticsService;
export default {
  getInstance: () => {
    if (!instance) {
      instance = new AnalyticsService();
    }
    return instance;
  },
};
