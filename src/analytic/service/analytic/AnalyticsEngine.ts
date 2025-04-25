import { getActiveClient } from '~/client/api/activeClient';
import { AnalyticsEventSyncer } from './AnalyticsEventSyncer';
import { AnalyticsEventCapturer } from './AnalyticsEventCapturer';

class AnalyticsEngine {
  private _client: Amity.Client;

  private _eventCapturer;

  private _eventSyncer;

  constructor() {
    this._client = getActiveClient();
    this._eventCapturer = new AnalyticsEventCapturer();
    this._eventSyncer = new AnalyticsEventSyncer();
  }

  markPostAsViewed(postId: Amity.InternalPost['postId']) {
    if (
      this._client.sessionState === Amity.SessionStates.ESTABLISHED ||
      this._client.sessionState === Amity.SessionStates.TOKEN_EXPIRED // For case token_expired, we assume token is expired and gonna re-connect soon
    ) {
      this._eventCapturer.markPostAsViewed(postId);
    }
  }

  markStoryAsViewed(story: Amity.InternalStory) {
    if (
      this._client.sessionState === Amity.SessionStates.ESTABLISHED ||
      this._client.sessionState === Amity.SessionStates.TOKEN_EXPIRED // For case token_expired, we assume token is expired and gonna re-connect soon
    ) {
      this._eventCapturer.markStoryAsViewed(story);
    }
  }

  markAdAsViewed(ad: Amity.InternalAd, placement: Amity.AdPlacement) {
    if (
      this._client.sessionState === Amity.SessionStates.ESTABLISHED ||
      this._client.sessionState === Amity.SessionStates.TOKEN_EXPIRED
    ) {
      this._eventCapturer.markAdAsViewed(ad, placement);
    }
  }

  markAdAsClicked(ad: Amity.InternalAd, placement: Amity.AdPlacement) {
    if (
      this._client.sessionState === Amity.SessionStates.ESTABLISHED ||
      this._client.sessionState === Amity.SessionStates.TOKEN_EXPIRED
    ) {
      this._eventCapturer.markAdAsClicked(ad, placement);
    }
  }

  markStoryAsClicked(story: Amity.InternalStory) {
    if (
      this._client.sessionState === Amity.SessionStates.ESTABLISHED ||
      this._client.sessionState === Amity.SessionStates.TOKEN_EXPIRED
    ) {
      this._eventCapturer.markStoryAsClicked(story);
    }
  }

  established() {
    this._eventSyncer.start();
  }

  handleTokenExpired() {
    this._stopAndDestroy();
  }

  destroy() {
    this._stopAndDestroy();
  }

  _stopAndDestroy() {
    this._eventSyncer.stop();
    this._eventCapturer.resetAllBuckets();
  }
}

let instance: AnalyticsEngine;

export default {
  getInstance: () => {
    if (!instance) {
      instance = new AnalyticsEngine();
    }
    return instance;
  },
};
