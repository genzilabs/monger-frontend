import { browser } from "$app/environment";

const STORAGE_KEY = "monger_transaction_settings";

type WeekendHandling = "none" | "prev_friday" | "next_monday";
type WeeklyStartDay = "monday" | "sunday";

interface TransactionSettings {
    monthlyResetDay: number; // 1-28
    weekendHandling: WeekendHandling;
    weeklyStartDay: WeeklyStartDay;
}

const DEFAULT_SETTINGS: TransactionSettings = {
    monthlyResetDay: 1,
    weekendHandling: "none",
    weeklyStartDay: "monday",
};

class TransactionSettingsStore {
    settings = $state<TransactionSettings>(DEFAULT_SETTINGS);

    constructor() {
        if (browser) {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
                } catch {
                    this.settings = DEFAULT_SETTINGS;
                }
            }
        }
    }

    get monthlyResetDay() {
        return this.settings.monthlyResetDay;
    }

    get weekendHandling() {
        return this.settings.weekendHandling;
    }

    get weeklyStartDay() {
        return this.settings.weeklyStartDay;
    }

    setMonthlyResetDay(day: number) {
        if (day < 1 || day > 28) return;
        this.settings.monthlyResetDay = day;
        this.persist();
    }

    setWeekendHandling(handling: WeekendHandling) {
        this.settings.weekendHandling = handling;
        this.persist();
    }

    setWeeklyStartDay(day: WeeklyStartDay) {
        this.settings.weeklyStartDay = day;
        this.persist();
    }

    private persist() {
        if (browser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        }
    }

    /**
     * Check if a given day of month falls on a weekend for a reference date
     */
    isWeekend(day: number, referenceDate: Date = new Date()): boolean {
        const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    }

    /**
     * Get the actual reset day after applying weekend handling
     */
    getEffectiveResetDay(referenceDate: Date = new Date()): number {
        const day = this.settings.monthlyResetDay;
        const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            switch (this.settings.weekendHandling) {
                case "prev_friday":
                    // Saturday -> Friday (-1), Sunday -> Friday (-2)
                    return day - (dayOfWeek === 6 ? 1 : 2);
                case "next_monday":
                    // Saturday -> Monday (+2), Sunday -> Monday (+1)
                    return day + (dayOfWeek === 6 ? 2 : 1);
                default:
                    return day;
            }
        }
        return day;
    }

    /**
     * Get the start date of a period for a given reference date
     * based on the monthly reset day setting (with weekend handling)
     */
    getPeriodStart(referenceDate: Date): Date {
        const day = this.getEffectiveResetDay(referenceDate);
        const result = new Date(referenceDate);

        // If we're before the reset day this month, go back to previous month
        if (referenceDate.getDate() < day) {
            result.setMonth(result.getMonth() - 1);
        }

        result.setDate(day);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Get the end date of a period (day before next reset)
     */
    getPeriodEnd(referenceDate: Date): Date {
        const periodStart = this.getPeriodStart(referenceDate);
        const nextMonth = new Date(periodStart);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const day = this.getEffectiveResetDay(nextMonth);
        const endDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day - 1);
        endDate.setHours(23, 59, 59, 999);
        return endDate;
    }

    /**
     * Group transactions into 7-day periods based on the reset day
     */
    groupByWeeklyPeriods<T extends { date: string }>(
        transactions: T[],
        referenceDate: Date = new Date()
    ): Map<string, T[]> {
        const groups = new Map<string, T[]>();
        const periodStart = this.getPeriodStart(referenceDate);

        for (const tx of transactions) {
            const txDate = new Date(tx.date);
            const daysSincePeriodStart = Math.floor(
                (txDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Calculate which 7-day period this falls into
            const periodIndex = Math.floor(daysSincePeriodStart / 7);
            const periodStartDate = new Date(periodStart);
            periodStartDate.setDate(periodStartDate.getDate() + periodIndex * 7);

            const periodEndDate = new Date(periodStartDate);
            periodEndDate.setDate(periodEndDate.getDate() + 6);

            const key = `${formatDateShort(periodStartDate)} - ${formatDateShort(periodEndDate)}`;

            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(tx);
        }

        return groups;
    }
}

function formatDateShort(date: Date): string {
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
    });
}

export const transactionSettingsStore = new TransactionSettingsStore();
export type { WeekendHandling, WeeklyStartDay };
