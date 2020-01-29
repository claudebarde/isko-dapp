<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";

  export let type;
  export let size;

  const dispatch = createEventDispatcher();

  const fadeDuration = 200;

  const close = () => {
    dispatch("close", true);
  };
</script>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    opacity: 0.75;
    background-color: #2d3748;
  }

  .transparent-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: 50;
    overflow: auto;
    background-color: transparent;
  }

  .modal {
    position: relative;
    max-height: 70%;
    border-radius: 0.5rem;
    background-color: white;
    padding: 0;
  }

  .small-modal {
    width: 33%;
  }

  .large-modal {
    width: 50%;
  }

  .modal__close {
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 0.5rem;
    cursor: pointer;
  }

  .title {
    font-weight: bold;
    padding: 1rem;
    margin: 0;
    color: white;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  .info {
    background-color: #4299e1;
  }

  .success {
    background-color: #48bb78;
  }

  .warning {
    background-color: #ed8936;
  }

  .error {
    background-color: #f56565;
  }

  .body {
    padding: 1.5rem;
    overflow: auto;
  }
</style>

<!-- The less opaque grey background -->
<div
  class="backdrop"
  in:fade={{ duration: fadeDuration }}
  out:fade={{ delay: 100, duration: fadeDuration }} />
<!-- The transparent div with the same dimensions on top of it -->
<div
  class="transparent-backdrop"
  in:fade={{ delay: 100, duration: fadeDuration }}
  out:fade={{ duration: fadeDuration }}>
  <div
    class={`modal ${size === 'small' ? 'small-modal' : 'large-modal'}`}
    in:fly={{ y: 150, duration: fadeDuration * 3, delay: 300 }}
    out:fly={{ y: 150, duration: fadeDuration * 3 }}>
    <img src="images/x.svg" alt="close" class="modal__close" on:click={close} />
    <p class={`title ${type}`}>
      <slot name="title" />
    </p>
    <div class="body">
      <slot name="body" />
    </div>
  </div>
</div>
