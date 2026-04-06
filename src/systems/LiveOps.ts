export interface SeasonalEvent {
  id: string;
  name: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  xpMultiplier: number;
  coinMultiplier: number;
  themeColor?: number;
  description: string;
}

const EVENTS: SeasonalEvent[] = [
  {
    id: 'spring_cleanup',
    name: 'Spring Cleanup',
    startDate: '2026-03-20',
    endDate: '2026-04-20',
    xpMultiplier: 1.5,
    coinMultiplier: 1.25,
    themeColor: 0x7CB69D,
    description: 'Spring is here! Earn bonus coins and XP!',
  },
  {
    id: 'summer_splash',
    name: 'Summer Splash',
    startDate: '2026-06-21',
    endDate: '2026-07-21',
    xpMultiplier: 1.5,
    coinMultiplier: 1.5,
    themeColor: 0x6BAED6,
    description: 'Beat the heat with bonus rewards!',
  },
];

class LiveOpsClass {
  private activeEvent: SeasonalEvent | null = null;

  init(): void {
    this.checkActiveEvents();
  }

  private checkActiveEvents(): void {
    const now = new Date().toISOString().split('T')[0];
    this.activeEvent = EVENTS.find(e => now >= e.startDate && now <= e.endDate) || null;
  }

  getActiveEvent(): SeasonalEvent | null {
    return this.activeEvent;
  }

  getCoinMultiplier(): number {
    return this.activeEvent?.coinMultiplier ?? 1;
  }

  getXPMultiplier(): number {
    return this.activeEvent?.xpMultiplier ?? 1;
  }

  hasActiveEvent(): boolean {
    return this.activeEvent !== null;
  }
}

export const LiveOps = new LiveOpsClass();
