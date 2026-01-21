<script lang="ts">
  import * as Icons from '$lib/icons';
  import type { Component } from 'svelte';

  interface Props {
    name: string;
    size?: number;
    class?: string;
  }

  let { name, size = 20, class: className = '' }: Props = $props();

  const iconMap: Record<string, Component> = {
    'wallet': Icons.WalletIcon,
    'bank': Icons.BankIcon,
    'cash': Icons.CashIcon,
    'credit': Icons.CreditCardIcon,
    'credit-card': Icons.CreditCardIcon,
    'debit': Icons.CreditCardIcon,
    'e-wallet': Icons.SmartphoneIcon,
    'smartphone': Icons.SmartphoneIcon,
    'investment': Icons.SlidersIcon, // Placeholder
    'payable': Icons.ClipboardIcon, // Placeholder
    'receivable': Icons.CheckIcon, // Placeholder
    'home': Icons.HomeIcon,
    'settings': Icons.SettingsIcon,
    'user': Icons.UserIcon,
    'shield': Icons.ShieldIcon,
    'edit': Icons.EditIcon,
    'trash': Icons.TrashIcon,
    'plus': Icons.PlusIcon,
    'arrow-left': Icons.ChevronLeftIcon,
    'arrow-right': Icons.ChevronRightIcon,
    'pencil': Icons.EditIcon, 
    'money-bill': Icons.CashIcon,
    'piggy-bank': Icons.WalletIcon, // Placeholder
    'chart-line': Icons.SlidersIcon, // Placeholder
    'file-invoice-dollar': Icons.ClipboardIcon, // Placeholder
    'hand-holding-dollar': Icons.WalletIcon, // Placeholder
  };

  const IconComponent = $derived(iconMap[name] || Icons.WalletIcon || null);
</script>

<IconComponent {size} class={className} />
