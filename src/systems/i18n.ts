type Locale = 'en' | 'es' | 'ja' | 'ko' | 'de' | 'fr' | 'pt';

const EN: Record<string, string> = {
  // Home
  'home.title': 'Tiny Fixers',
  'home.play': 'Play',
  'home.endless': 'Endless',
  'home.hub': 'Neighborhood',
  'home.settings': 'Settings',
  'home.achievements': 'Achievements',
  'home.daily': 'Daily Challenge',

  // Game
  'game.pause': 'Pause',
  'game.resume': 'Resume',
  'game.quit': 'Quit',

  // Results
  'results.complete': 'Level Complete!',
  'results.timeup': "Time's Up!",
  'results.tryagain': 'Try to be faster and more accurate!',
  'results.nextlevel': 'Next Level',
  'results.retry': 'Retry',
  'results.home': 'Home',
  'results.doublecoins': '2x Coins',
  'results.share': 'Share',
  'results.time': 'Time',
  'results.materials': 'Materials',
  'results.encouragement': "Don't give up! Try again!",

  // Hub
  'hub.title': 'Neighborhood',
  'hub.locked': 'Locked',
  'hub.upgrade': 'Upgrade',
  'hub.stars_needed': '{count} stars needed',

  // Tutorial
  'tutorial.welcome': 'Welcome! Drag the RED ball to the RED bin!',
  'tutorial.blue': 'Now drag the BLUE ball to the BLUE bin!',
  'tutorial.done': "You're a natural! Let's go!",
  'tutorial.start': 'Start Playing!',

  // Settings
  'settings.title': 'Settings',
  'settings.music': 'Music',
  'settings.sfx': 'Sound Effects',
  'settings.haptics': 'Haptics',
  'settings.reset': 'Reset Progress',

  // Battle Pass
  'battlepass.title': 'Battle Pass',
  'battlepass.tier': 'Tier {level}',
  'battlepass.claim': 'Claim',
  'battlepass.premium': 'Premium',
  'battlepass.free': 'Free',

  // Misc
  'misc.coins': 'Coins',
  'misc.stars': 'Stars',
  'misc.streak': '{count} Day Streak',
};

const LOCALES: Record<Locale, Record<string, string>> = {
  en: EN,
  es: {},
  ja: {},
  ko: {},
  de: {},
  fr: {},
  pt: {},
};

class I18nClass {
  private locale: Locale = 'en';
  private strings: Record<string, string> = EN;

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.strings = { ...EN, ...(LOCALES[locale] || {}) };
  }

  getLocale(): Locale {
    return this.locale;
  }

  t(key: string, params?: Record<string, string | number>): string {
    let str = this.strings[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  }
}

export const i18n = new I18nClass();
