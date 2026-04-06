import { EventBus } from '@/core/EventBus';

type AnalyticsProvider = 'none' | 'firebase' | 'amplitude';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

class AnalyticsClass {
  private provider: AnalyticsProvider = 'none';
  private queue: AnalyticsEvent[] = [];
  private sessionId: string = '';
  private sessionStart: number = 0;
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.provider = 'none';
    this.sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.sessionStart = Date.now();

    // Subscribe to all trackable events
    EventBus.on('level:complete', (d) => this.track('level_complete', d));
    EventBus.on('level:fail', (d) => this.track('level_fail', d));
    EventBus.on('level:start', (d) => this.track('level_start', d));
    EventBus.on('hub:upgrade', (d) => this.track('hub_upgrade', d));
    EventBus.on('achievement:unlocked', (d) => this.track('achievement_unlocked', d));
    EventBus.on('daily:streak', (d) => this.track('daily_streak', d));
    EventBus.on('tutorial:completed', () => this.track('ftue_complete', {}));
    EventBus.on('scene:transition', (d) => this.track('screen_view', d));
    EventBus.on('battlepass:xp', (d) => this.track('battlepass_xp', d));
    EventBus.on('battlepass:tierup', (d) => this.track('battlepass_tierup', d));
    EventBus.on('ad:shown', (d) => this.track('ad_shown', d));
    EventBus.on('endless:highscore', (d) => this.track('endless_highscore', d));
    EventBus.on('currency:earned', (d) => this.track('currency_earned', d));
    EventBus.on('currency:spent', (d) => this.track('currency_spent', d));

    this.track('session_start', { returning: true });
  }

  track(event: string, properties: Record<string, unknown>): void {
    const enriched: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.queue.push(enriched);

    if (this.provider === 'none') {
      // Dev mode: log to console
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        console.debug(`[Analytics] ${event}`, properties);
      }
      // Clear queue since we're not sending anywhere
      this.queue = [];
      return;
    }

    this.flush();
  }

  private flush(): void {
    if (this.queue.length === 0) return;

    // Future: send batch to analytics provider
    // For now, just clear the queue
    this.queue = [];
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const Analytics = new AnalyticsClass();
