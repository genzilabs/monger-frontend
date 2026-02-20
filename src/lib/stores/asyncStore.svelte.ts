/**
 * Generic Async Store utilizing Svelte 5 runes
 * Handles boilerplate for loading states, errors, and basic TTL caching
 */

export class AsyncStore<T> {
  data = $state<T[]>([]);
  isLoading = $state(false);
  error = $state<string | null>(null);
  lastFetched = $state<number | null>(null);

  constructor(private cacheTtlMs = 5 * 60 * 1000) {}

  get isCacheValid() {
    return (
      this.lastFetched !== null &&
      Date.now() - this.lastFetched < this.cacheTtlMs
    );
  }

  /**
   * Load data using the provided fetcher function.
   * Caches results automatically based on TTL.
   */
  async load(fetcher: () => Promise<T[]>, forceRefresh = false): Promise<T[]> {
    if (!forceRefresh && this.isCacheValid && this.data.length > 0) {
      return this.data;
    }

    this.isLoading = true;
    this.error = null;

    try {
      this.data = await fetcher();
      this.lastFetched = Date.now();
      return this.data;
    } catch (e: any) {
      this.error = e.message || "An error occurred";
      return this.data;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Add a single item to the store without fetching
   */
  add(item: T) {
    this.data = [...this.data, item];
  }

  /**
   * Update a single item matching the predicate
   */
  update(predicate: (item: T) => boolean, updater: (item: T) => T) {
    this.data = this.data.map((item) =>
      predicate(item) ? updater(item) : item,
    );
  }

  /**
   * Remove items matching the predicate
   */
  remove(predicate: (item: T) => boolean) {
    this.data = this.data.filter((item) => !predicate(item));
  }

  /**
   * Force the next load to bypass cache
   */
  invalidate() {
    this.lastFetched = null;
  }

  /**
   * Clear all data and reset state
   */
  reset() {
    this.data = [];
    this.isLoading = false;
    this.error = null;
    this.lastFetched = null;
  }
}
