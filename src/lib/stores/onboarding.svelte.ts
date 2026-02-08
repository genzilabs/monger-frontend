import { browser } from "$app/environment";

const STORAGE_KEY = "monger_onboarding_completed";

class OnboardingStore {
    completed = $state(false);
    currentStep = $state(0);

    constructor() {
        if (browser) {
            this.completed = localStorage.getItem(STORAGE_KEY) === "true";
        }
    }

    nextStep() {
        this.currentStep++;
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
        }
    }

    goToStep(step: number) {
        this.currentStep = step;
    }

    complete() {
        this.completed = true;
        if (browser) {
            localStorage.setItem(STORAGE_KEY, "true");
        }
    }

    reset() {
        this.completed = false;
        this.currentStep = 0;
        if (browser) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

export const onboardingStore = new OnboardingStore();
