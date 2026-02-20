import { booksStore } from "$lib/stores";
import {
    transactionsApi,
    type CategoryBreakdown,
} from "$lib/api/transactions";
import { untrack } from "svelte";

export function createDashboardState() {
    let monthlyIncome = $state(0);
    let monthlyExpense = $state(0);
    let summaryLoading = $state(true);

    let incomeBreakdown = $state<CategoryBreakdown[]>([]);
    let expenseBreakdown = $state<CategoryBreakdown[]>([]);
    let chartLoading = $state(true);

    async function loadData() {
        const bookId = booksStore.activeBook?.id;
        if (!bookId) return;

        summaryLoading = true;
        chartLoading = true;
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            // Parallel requests for summary and breakdown
            const [summaryRes, incomeRes, expenseRes] = await Promise.all([
                transactionsApi.getMonthlySummary(bookId, month, year),
                transactionsApi.getCategoryBreakdown(bookId, "income", month, year),
                transactionsApi.getCategoryBreakdown(bookId, "expense", month, year),
            ]);

            if (summaryRes.data) {
                monthlyIncome = summaryRes.data.summary.total_income;
                monthlyExpense = summaryRes.data.summary.total_expense;
            }

            if (incomeRes.data) incomeBreakdown = incomeRes.data;
            if (expenseRes.data) expenseBreakdown = expenseRes.data;
        } catch (e) {
            console.error("Failed to load dashboard data:", e);
        } finally {
            summaryLoading = false;
            chartLoading = false;
        }
    }

    // Auto-reload on active book change
    $effect(() => {
        const bookId = booksStore.activeBook?.id;
        if (bookId) {
            untrack(() => loadData());
        }
    });

    return {
        get monthlyIncome() { return monthlyIncome; },
        get monthlyExpense() { return monthlyExpense; },
        get summaryLoading() { return summaryLoading; },

        get incomeBreakdown() { return incomeBreakdown; },
        get expenseBreakdown() { return expenseBreakdown; },
        get chartLoading() { return chartLoading; },
        
        load: loadData
    };
}
