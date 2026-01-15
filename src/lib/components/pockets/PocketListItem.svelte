<script lang="ts">
  import type { Pocket } from "$lib/types";
  import {
    CashIcon,
    BankIcon,
    SmartphoneIcon,
    CreditCardIcon,
    ChevronRightIcon,
  } from "$lib/icons";
  import { formatCurrency } from "$lib/utils/currency";

  interface Props {
    pocket: Pocket;
    currency?: string;
    onclick?: () => void;
  }

  let { pocket, currency = "IDR", onclick }: Props = $props();

  const pocketIcons: Record<string, any> = {
    cash: CashIcon,
    bank: BankIcon,
    "e-wallet": SmartphoneIcon,
    credit: CreditCardIcon,
  };

  const Icon = pocketIcons[pocket.type_slug] || CashIcon;
</script>

<button
  {onclick}
  class="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-2xl hover:bg-surface-elevated hover:border-primary/20 transition-all group text-left"
>
  <div class="flex items-center gap-4">
    <!-- Icon Container -->
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style="background-color: {pocket.color}20; color: {pocket.color}"
    >
      <Icon size={24} />
    </div>

    <!-- Content -->
    <div>
      <h3 class="font-semibold text-foreground mb-0.5">{pocket.name}</h3>
      <p class="text-sm font-bold text-primary">
        {formatCurrency(pocket.balance_cents, currency)}
      </p>
    </div>
  </div>

  <!-- Chevron -->
  <ChevronRightIcon
    class="text-muted group-hover:text-primary transition-colors"
    size={20}
  />
</button>
