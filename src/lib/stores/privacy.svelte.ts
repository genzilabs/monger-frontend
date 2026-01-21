import { browser } from "$app/environment";

const STORAGE_KEY = "monger_hide_amounts";

class PrivacyStore {
  hideAmounts = $state(false);

  constructor() {
    if (browser) {
      this.hideAmounts = localStorage.getItem(STORAGE_KEY) === "true";
    }
  }

  toggle() {
    this.hideAmounts = !this.hideAmounts;
    if (browser) {
      localStorage.setItem(STORAGE_KEY, String(this.hideAmounts));
    }
  }

  /**
   * Mask a currency value if hidden
   */
  mask(value: string): string {
    return this.hideAmounts ? "••••" : value;
  }
}

export const privacyStore = new PrivacyStore();
