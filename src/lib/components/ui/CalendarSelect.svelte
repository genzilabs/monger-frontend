<script lang="ts">
    import {
        CalendarIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
    } from "$lib/icons";

    interface Props {
        value: string; // ISO date string (YYYY-MM-DD) or empty
        onSelect: (date: string) => void;
        placeholder?: string;
        label?: string;
    }

    let {
        value = "",
        onSelect,
        placeholder = "Pilih tanggal",
        label,
    }: Props = $props();

    let isOpen = $state(false);
    let viewDate = $state(new Date());

    // Initialize viewDate from value when it changes
    $effect(() => {
        if (value) {
            viewDate = new Date(value);
        }
    });

    // Month and year for display
    const monthYear = $derived(
        viewDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
        }),
    );

    // Days of week headers
    const dayHeaders = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    // Generate calendar grid for current month view
    const calendarDays = $derived.by(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Start from Sunday of the week containing first day
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: {
            date: Date;
            isCurrentMonth: boolean;
            isToday: boolean;
            isSelected: boolean;
        }[] = [];

        // Generate 6 weeks of days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const isCurrentMonth = currentDate.getMonth() === month;
            const today = new Date();
            const isToday = currentDate.toDateString() === today.toDateString();
            const isSelected = Boolean(
                value && currentDate.toISOString().split("T")[0] === value,
            );

            days.push({
                date: currentDate,
                isCurrentMonth,
                isToday,
                isSelected,
            });
        }

        return days;
    });

    // Format display value
    const displayValue = $derived(
        value
            ? new Date(value).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
              })
            : "",
    );

    function navigatePrevMonth() {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    }

    function navigateNextMonth() {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    }

    function selectDate(date: Date) {
        const isoDate = date.toISOString().split("T")[0];
        onSelect(isoDate);
        isOpen = false;
    }

    function toggleCalendar() {
        if (!isOpen && !value) {
            viewDate = new Date();
        }
        isOpen = !isOpen;
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest(".calendar-select-container")) {
            isOpen = false;
        }
    }

    $effect(() => {
        if (isOpen) {
            document.addEventListener("click", handleClickOutside);
            return () =>
                document.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<div class="calendar-select-container relative">
    {#if label}
        <span class="block text-xs text-muted mb-1">{label}</span>
    {/if}

    <!-- Trigger Button -->
    <button
        type="button"
        onclick={toggleCalendar}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        class="w-full flex items-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-xl text-sm transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 {value
            ? 'text-foreground'
            : 'text-muted'}"
    >
        <CalendarIcon size={16} />
        <span class="flex-1 text-left">
            {displayValue || placeholder}
        </span>
    </button>

    <!-- Calendar Dropdown -->
    {#if isOpen}
        <div
            class="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg z-50 p-3"
        >
            <!-- Month Navigation -->
            <div class="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onclick={navigatePrevMonth}
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors text-muted hover:text-foreground"
                    aria-label="Bulan sebelumnya"
                >
                    <ChevronLeftIcon size={16} />
                </button>

                <span class="text-sm font-medium text-foreground">
                    {monthYear}
                </span>

                <button
                    type="button"
                    onclick={navigateNextMonth}
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors text-muted hover:text-foreground"
                    aria-label="Bulan berikutnya"
                >
                    <ChevronRightIcon size={16} />
                </button>
            </div>

            <!-- Day Headers -->
            <div class="grid grid-cols-7 gap-1 mb-1">
                {#each dayHeaders as day}
                    <div class="text-xs text-muted text-center py-1">
                        {day}
                    </div>
                {/each}
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1">
                {#each calendarDays as { date, isCurrentMonth, isToday, isSelected }}
                    <button
                        type="button"
                        onclick={() => selectDate(date)}
                        class="w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors
                            {isSelected
                            ? 'bg-primary text-white'
                            : isToday
                              ? 'bg-primary/10 text-primary font-medium'
                              : isCurrentMonth
                                ? 'text-foreground hover:bg-surface-elevated'
                                : 'text-muted/50 hover:bg-surface-elevated'}"
                    >
                        {date.getDate()}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
