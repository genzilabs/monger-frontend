/**
 * Significance Calculation Utility
 *
 * Determines whether a change between two values is meaningful enough
 * to warrant visual indication. Aligns with Monger's calm, reflective philosophy.
 *
 * A change is significant if:
 * - Percentage difference ≥ threshold (default 15%)
 * - OR absolute difference ≥ threshold (default Rp100.000 = 10,000,000 cents)
 */

export interface SignificanceResult {
    isSignificant: boolean;
    direction: "up" | "down" | "none";
}

/**
 * Default thresholds
 */
export const DEFAULT_PERCENT_THRESHOLD = 15; // 15%
export const DEFAULT_ABSOLUTE_THRESHOLD = 10_000_000; // Rp100.000 in cents

/**
 * Calculate whether a change between current and previous value is significant.
 *
 * @param current - Current period value (in cents)
 * @param previous - Previous period value (in cents)
 * @param percentThreshold - Minimum percentage change to be significant (default: 15)
 * @param absoluteThreshold - Minimum absolute change in cents to be significant (default: 10,000,000)
 * @returns SignificanceResult with isSignificant flag and direction
 */
export function calculateSignificance(
    current: number,
    previous: number,
    percentThreshold: number = DEFAULT_PERCENT_THRESHOLD,
    absoluteThreshold: number = DEFAULT_ABSOLUTE_THRESHOLD
): SignificanceResult {
    // Both zero: no change, not significant
    if (current === 0 && previous === 0) {
        return { isSignificant: false, direction: "none" };
    }

    // Previous is zero, current has value: new data, no meaningful comparison
    if (previous === 0 && current > 0) {
        return { isSignificant: false, direction: "none" };
    }

    // Current is zero, previous had value: complete drop, significant
    if (current === 0 && previous > 0) {
        return { isSignificant: true, direction: "down" };
    }

    const absoluteDiff = Math.abs(current - previous);
    const percentDiff = (absoluteDiff / previous) * 100;

    const isSignificant =
        percentDiff >= percentThreshold || absoluteDiff >= absoluteThreshold;

    let direction: "up" | "down" | "none" = "none";
    if (isSignificant) {
        direction = current > previous ? "up" : "down";
    }

    return { isSignificant, direction };
}

/**
 * Check if expense increase is significant (for showing upward arrow on expense)
 * Expense going UP is shown with upward arrow (muted red)
 */
export function isExpenseSignificantlyHigher(
    currentExpense: number,
    previousExpense: number
): SignificanceResult {
    return calculateSignificance(currentExpense, previousExpense);
}

/**
 * Check if income change is significant (for showing downward arrow on income)
 * Income going DOWN is shown with downward arrow (muted green)
 */
export function isIncomeSignificantlyDifferent(
    currentIncome: number,
    previousIncome: number
): SignificanceResult {
    return calculateSignificance(currentIncome, previousIncome);
}
