import type { Transaction } from "$lib/types/transaction";
import { calculateSignificance } from "./significance";

export interface DateGroup {
  label: string;
  fullDate: string;
  dateKey: string;
  transactions: Transaction[];
  income: number;
  expense: number;
}

export interface SignificanceMap {
  expense: { isSignificant: boolean; direction: "up" | "down" | "none" };
  income: { isSignificant: boolean; direction: "up" | "down" | "none" };
}

// Parse date string to local date
// For UTC datetime strings (ending in Z or with timezone offset),
// we convert to local time first, then extract the local date
export function parseLocalDate(dateStr: string): Date {
  // If it's just a date (YYYY-MM-DD), parse as local time (midnight local)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  // For datetime strings (with time/timezone), parse as-is to get correct local date
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDateKey(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Groups a list of transactions into "Recent" bins (Today, Yesterday, 2 Days Ago)
 * Note: Returns an array sorted from newest date to oldest date.
 */
export function groupRecentTransactions(txList: Transaction[]): DateGroup[] {
  if (!Array.isArray(txList) || txList.length === 0) return [];

  const groupsMap: Record<string, DateGroup> = {};
  const now = new Date();

  // Create date boundaries
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  const sorted = [...txList].sort(
    (a, b) =>
      parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime(),
  );

  for (const tx of sorted) {
    const txDate = parseLocalDate(tx.date);
    const txDateOnly = new Date(
      txDate.getFullYear(),
      txDate.getMonth(),
      txDate.getDate(),
    );

    // Check if transaction is within the last 3 days (including today)
    const isToday = txDateOnly.getTime() === today.getTime();
    const isYesterday = txDateOnly.getTime() === yesterday.getTime();
    const isTwoDaysAgo = txDateOnly.getTime() === twoDaysAgo.getTime();

    if (isToday || isYesterday || isTwoDaysAgo) {
      const dateKey = getDateKey(tx.date);
      const fullDate = txDate.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      let label: string;
      if (isToday) label = "Hari ini";
      else if (isYesterday) label = "Kemarin";
      else label = fullDate;

      if (!groupsMap[dateKey]) {
        groupsMap[dateKey] = {
          label,
          fullDate,
          dateKey,
          transactions: [],
          income: 0,
          expense: 0,
        };
      }
      groupsMap[dateKey].transactions.push(tx);
      if (tx.type === "income") {
        groupsMap[dateKey].income += tx.amount_cents;
      } else if (tx.type === "expense") {
        groupsMap[dateKey].expense += tx.amount_cents;
      }
    }
  }

  // Return sorted by date (newest first)
  return Object.values(groupsMap).sort(
    (a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime(),
  );
}

/**
 * Calculates significance metrics comparing a given grouped day to its previous day (if any)
 */
export function getSignificanceForGroups(groups: DateGroup[]): Record<string, SignificanceMap> {
  const map: Record<string, { expense: number; income: number }> = {};
  
  // Build lookup map for previous day values
  for (let i = 0; i < groups.length - 1; i++) {
    const current = groups[i];
    const previous = groups[i + 1]; // Because it's sorted newest to oldest
    map[current.dateKey] = {
      expense: previous.expense,
      income: previous.income,
    };
  }

  const result: Record<string, SignificanceMap> = {};
  
  for (const group of groups) {
    const prev = map[group.dateKey];
    if (!prev) {
      result[group.dateKey] = {
        expense: { isSignificant: false, direction: "none" },
        income: { isSignificant: false, direction: "none" },
      };
    } else {
      result[group.dateKey] = {
        expense: calculateSignificance(group.expense, prev.expense),
        income: calculateSignificance(group.income, prev.income),
      };
    }
  }

  return result;
}
