type AdProvider = 'none' | 'admob' | 'ironsource';

type AdCallback = (rewarded: boolean) => void;

class AdManagerClass {
  private provider: AdProvider = 'none';
  private _isReady: boolean = false;

  init(): void {
    // Future: detect environment and init ad SDK
    // For now, provider stays 'none' which gracefully hides all ad UI
    this.provider = 'none';
    this._isReady = false;
  }

  isAdAvailable(): boolean {
    if (this.provider === 'none') return false;
    return this._isReady;
  }

  showRewarded(placement: string, callback: AdCallback): void {
    if (this.provider === 'none') {
      callback(false);
      return;
    }

    // Future: call actual ad SDK
    console.log(`[AdManager] Showing rewarded ad for placement: ${placement}`);
    callback(false);
  }

  getProvider(): AdProvider {
    return this.provider;
  }
}

export const AdManager = new AdManagerClass();
