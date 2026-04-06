class ShareManagerClass {
  async shareResult(data: {
    levelName: string;
    stars: number;
    time: number;
    coins: number;
  }): Promise<boolean> {
    const text = `I completed "${data.levelName}" with ${data.stars} star${data.stars !== 1 ? 's' : ''} in Tiny Fixers! Can you beat my time of ${this.formatTime(data.time)}?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tiny Fixers',
          text,
          url: 'https://bigknoxy.github.io/tiny-fixers',
        });
        return true;
      } catch {
        // User cancelled or share failed
        return false;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\nhttps://bigknoxy.github.io/tiny-fixers`);
      return true;
    } catch {
      return false;
    }
  }

  isShareAvailable(): boolean {
    return !!navigator.share || !!navigator.clipboard;
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export const ShareManager = new ShareManagerClass();
