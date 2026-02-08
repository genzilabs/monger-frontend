<script lang="ts">
  /**
   * ReceiptScanner - Full-screen camera capture for receipt scanning
   * Uses device camera to capture receipt images and sends to AI for parsing
   */
  import { receiptsApi, type ReceiptScan } from "$lib/api/receipts";
  import { booksStore } from "$lib/stores/books.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { X, Camera, SwitchCamera, Zap, ZapOff, ImagePlus, Loader2, Check } from "lucide-svelte";
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
    onScanComplete: (scan: ReceiptScan) => void;
  }

  let { open, onClose, onScanComplete }: Props = $props();

  let videoElement: HTMLVideoElement | null = $state(null);
  let canvasElement: HTMLCanvasElement | null = $state(null);
  let fileInputElement: HTMLInputElement | null = $state(null);
  
  let stream: MediaStream | null = $state(null);
  let facingMode: "environment" | "user" = $state("environment");
  let flashEnabled = $state(false);
  let isCapturing = $state(false);
  let isProcessing = $state(false);
  let hasFlash = $state(false);
  let capturedImage: string | null = $state(null);
  let cameraError: string | null = $state(null);
  let userContext = $state(""); // User notes like "only count my coffee"

  async function startCamera() {
    cameraError = null;
    
    if (!browser) return;
    
    try {
      // Stop any existing stream
      stopCamera();
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoElement) {
        videoElement.srcObject = stream;
        await videoElement.play();
      }
      
      // Check if flash/torch is available
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      hasFlash = capabilities?.torch ?? false;
      
    } catch (err) {
      console.error('Camera error:', err);
      cameraError = err instanceof Error ? err.message : 'Failed to access camera';
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  async function toggleFlash() {
    if (!stream || !hasFlash) return;
    
    const track = stream.getVideoTracks()[0];
    flashEnabled = !flashEnabled;
    
    try {
      await track.applyConstraints({
        advanced: [{ torch: flashEnabled } as MediaTrackConstraintSet]
      });
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  }

  async function switchCamera() {
    facingMode = facingMode === "environment" ? "user" : "environment";
    await startCamera();
  }

  function capturePhoto() {
    if (!videoElement || !canvasElement) return;
    
    isCapturing = true;
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to video dimensions
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Draw the video frame
    ctx.drawImage(videoElement, 0, 0);
    
    // Get the image as base64
    capturedImage = canvasElement.toDataURL('image/jpeg', 0.85);
    
    isCapturing = false;
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastStore.error('Please select an image file');
      return;
    }
    
    // Read as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      capturedImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function retakePhoto() {
    capturedImage = null;
  }

  async function processReceipt() {
    if (!capturedImage || !booksStore.activeBook) {
      toastStore.error('No image captured or no book selected');
      return;
    }
    
    isProcessing = true;
    
    try {
      const result = await receiptsApi.scan({
        book_id: booksStore.activeBook.id,
        image: capturedImage,
        source: 'app',
        context: userContext || undefined
      });
      
      if (result.error) {
        toastStore.error(result.error.error || 'Failed to scan receipt');
        isProcessing = false;
        return;
      }
      
      if (result.data) {
        if (result.data.status === 'failed') {
          toastStore.error(result.data.error_message || 'Failed to parse receipt');
          isProcessing = false;
        } else {
          toastStore.success('Receipt scanned successfully!');
          // Stop camera before calling callback
          stopCamera();
          capturedImage = null;
          userContext = "";
          isProcessing = false;
          // Let parent handle showing confirmation modal
          onScanComplete(result.data);
        }
      }
    } catch (err) {
      console.error('Processing error:', err);
      toastStore.error('Failed to process receipt');
      isProcessing = false;
    }
  }

  function handleClose() {
    stopCamera();
    capturedImage = null;
    cameraError = null;
    isProcessing = false;
    onClose();
  }

  // Start camera when opened
  $effect(() => {
    if (open && browser) {
      tick().then(() => startCamera());
    } else {
      stopCamera();
    }
  });

  onMount(() => {
    return () => {
      stopCamera();
    };
  });
</script>

{#if open}
  <!-- Full screen camera overlay -->
  <div class="fixed inset-0 z-[100] bg-black flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
      <button
        onclick={handleClose}
        class="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label="Close camera"
      >
        <X size={24} />
      </button>
      
      <h2 class="text-white font-medium">Scan Receipt</h2>
      
      <div class="w-10"></div>
    </div>

    <!-- Camera view / Captured image -->
    <div class="flex-1 relative overflow-hidden">
      {#if capturedImage}
        <!-- Show captured image -->
        <img 
          src={capturedImage} 
          alt="Captured receipt" 
          class="w-full h-full object-contain bg-black"
        />
      {:else if cameraError}
        <!-- Camera error state -->
        <div class="flex flex-col items-center justify-center h-full text-white text-center p-8">
          <Camera size={64} class="mb-4 opacity-50" />
          <p class="text-lg mb-2">Camera access failed</p>
          <p class="text-sm text-white/70 mb-4">{cameraError}</p>
          <button
            onclick={() => startCamera()}
            class="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Try again
          </button>
          <button
            onclick={() => fileInputElement?.click()}
            class="mt-4 px-4 py-2 bg-primary/80 rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
          >
            <ImagePlus size={20} />
            Upload from gallery
          </button>
        </div>
      {:else}
        <!-- Live camera view -->
        <video
          bind:this={videoElement}
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover"
        ></video>
        
        <!-- Receipt frame guide -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-[85%] aspect-[3/4] border-2 border-white/50 rounded-lg">
            <div class="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              Position receipt within frame
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Bottom controls -->
    <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
      {#if capturedImage}
        <!-- Post-capture controls -->
        <div class="space-y-4">
          <!-- Context input -->
          <div class="px-2">
            <input
              type="text"
              bind:value={userContext}
              placeholder="Add context (e.g. 'only count my coffee')"
              disabled={isProcessing}
              class="w-full px-4 py-2 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-primary focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-center gap-6">
            <button
              onclick={retakePhoto}
              disabled={isProcessing}
              class="px-6 py-3 bg-white/20 text-white rounded-full font-medium hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              Retake
            </button>
            
            <button
              onclick={processReceipt}
              disabled={isProcessing}
              class="px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {#if isProcessing}
                <Loader2 size={20} class="animate-spin" />
                Processing...
              {:else}
                <Check size={20} />
                Use Photo
              {/if}
            </button>
          </div>
        </div>
      {:else}
        <!-- Camera controls -->
        <div class="flex items-center justify-between">
          <!-- Gallery button -->
          <button
            onclick={() => fileInputElement?.click()}
            class="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Choose from gallery"
          >
            <ImagePlus size={24} />
          </button>
          
          <!-- Capture button -->
          <button
            onclick={capturePhoto}
            disabled={isCapturing || !stream}
            class="w-20 h-20 rounded-full bg-white border-4 border-white/50 hover:scale-95 active:scale-90 transition-transform disabled:opacity-50 flex items-center justify-center"
            aria-label="Capture photo"
          >
            {#if isCapturing}
              <Loader2 size={32} class="text-black animate-spin" />
            {/if}
          </button>
          
          <!-- Camera controls group -->
          <div class="flex gap-2">
            {#if hasFlash}
              <button
                onclick={toggleFlash}
                class="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                class:bg-yellow-500={flashEnabled}
                class:hover:bg-yellow-600={flashEnabled}
                aria-label="Toggle flash"
              >
                {#if flashEnabled}
                  <Zap size={24} />
                {:else}
                  <ZapOff size={24} />
                {/if}
              </button>
            {/if}
            
            <button
              onclick={switchCamera}
              class="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Switch camera"
            >
              <SwitchCamera size={24} />
            </button>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Hidden canvas for capture -->
    <canvas bind:this={canvasElement} class="hidden"></canvas>
    
    <!-- Hidden file input -->
    <input
      bind:this={fileInputElement}
      type="file"
      accept="image/*"
      onchange={handleFileSelect}
      class="hidden"
    />
  </div>
{/if}
