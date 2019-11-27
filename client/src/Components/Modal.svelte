<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  export let type;
  export let size;

  const dispatch = createEventDispatcher();

  const fadeDuration = 200;
  let titleBg = "title-info";
  switch (type) {
    case "signup":
      titleBg = "title-success";
      break;
    case "warning":
      titleBg = "title-warning";
      break;
  }

  const close = () => {
    dispatch("close", true);
  };
</script>

<style>
  .backdrop {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 50;
    opacity: 0.75;
    background-color: #2d3748;
  }

  .transparent-backdrop {
    position: fixed;
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
    overflow: auto;
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

  .title-info {
    background-color: #4299e1;
  }

  .title-success {
    background-color: #48bb78;
  }

  .title-warning {
    background-color: #ed8936;
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
  <div class={`modal ${size === 'small' ? 'small-modal' : 'large-modal'}`}>
    <img src="images/x.svg" alt="close" class="modal__close" on:click={close} />
    <p class={`title ${titleBg}`}>
      <slot name="title" />
    </p>
    <div style="padding:0.75rem">
      <slot name="body" />
    </div>
  </div>
</div>
