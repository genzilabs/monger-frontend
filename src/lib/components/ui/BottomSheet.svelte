<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onClose, title, children }: Props = $props();

  // Bottom sheet state
  let height = $state(74);
  let isDragging = $state(false);

  function startDrag(startY: number) {
    isDragging = true;
    const startHeight = height;

    const handleMove = (clientY: number) => {
      const deltaY = startY - clientY;
      const deltaPercent = (deltaY / window.innerHeight) * 100;
      const newHeight = Math.min(100, Math.max(20, startHeight + deltaPercent));
      height = newHeight;
    };

    const handleEnd = () => {
      isDragging = false;
      if (height < 40) {
        onClose();
        height = 74;
      } else if (height > 85) {
        height = 100;
      } else {
        height = 74;
      }
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
  }

  function handleBackdropClick() {
    onClose();
    height = 74;
  }
</script>

{#if open}
  <div
    class="fixed inset-0 bg-black/50 flex items-end justify-center z-[60]"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
  >
    <div
      class="w-full bg-background p-6 pb-6 overflow-y-auto animate-slide-up {isDragging
        ? ''
        : 'transition-all duration-300'} {height >= 100
        ? 'rounded-none'
        : 'rounded-t-3xl'}"
      style="height: {height}vh"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Drag Handle -->
      <div
        class="w-full flex justify-center mb-4 -mt-2 py-3 cursor-grab active:cursor-grabbing touch-none"
        onmousedown={(e) => startDrag(e.clientY)}
        ontouchstart={(e) => startDrag(e.touches[0].clientY)}
      >
        <div class="w-12 h-1.5 rounded-full bg-border"></div>
      </div>

      {#if title}
        <h2 class="text-xl font-bold text-foreground mb-4">{title}</h2>
      {/if}

      {@render children()}
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
