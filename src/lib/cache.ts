interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new MemoryCache();

export const CACHE_TTL = {
  ACTIVITIES: 5 * 60,      // 5 minutes
  ACTIVITY_DETAIL: 30 * 60, // 30 minutes
  STATS: 10 * 60,          // 10 minutes
  ZONES: 60 * 60,          // 1 hour
  ADVANCED_STATS: 10 * 60, // 10 minutes
  PREMIUM_STATS: 10 * 60,  // 10 minutes
  PREDICTIONS: 15 * 60,    // 15 minutes
  BEST_EFFORTS: 30 * 60,   // 30 minutes
};

export function getCacheKey(userId: number, type: string, ...params: (string | number)[]): string {
  return `${userId}:${type}:${params.join(":")}`;
}
