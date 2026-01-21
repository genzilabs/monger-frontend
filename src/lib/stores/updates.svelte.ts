import { browser } from "$app/environment";
import { getLatestVersion, getLatestUpdate, type Update } from "$lib/data/updates";

const STORAGE_KEY = "monger_last_seen_update";

class UpdatesStore {
  lastSeenVersion = $state<string | null>(null);
  showModal = $state(false);

  constructor() {
    if (browser) {
      this.lastSeenVersion = localStorage.getItem(STORAGE_KEY);
    }
  }

  /**
   * Check if there's an unseen update
   */
  get hasUnseenUpdate(): boolean {
    const latestVersion = getLatestVersion();
    return this.lastSeenVersion !== latestVersion;
  }

  /**
   * Get the latest update details
   */
  get latestUpdate(): Update | null {
    return getLatestUpdate();
  }

  /**
   * Show the update modal (called after login)
   */
  checkAndShowModal() {
    if (browser && this.hasUnseenUpdate) {
      // Small delay to not interrupt login flow
      setTimeout(() => {
        this.showModal = true;
      }, 500);
    }
  }

  /**
   * Mark the current update as seen and close modal
   */
  markAsSeen() {
    const latestVersion = getLatestVersion();
    this.lastSeenVersion = latestVersion;
    this.showModal = false;
    
    if (browser) {
      localStorage.setItem(STORAGE_KEY, latestVersion);
    }
  }

  /**
   * Close modal without marking as seen (user can see again next session)
   */
  dismissModal() {
    this.showModal = false;
  }
}

export const updatesStore = new UpdatesStore();
