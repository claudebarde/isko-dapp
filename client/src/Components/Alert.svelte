<script>
  export let text;
  export let type;
  export let hasDot;
  export let hasIcon = false;
  import { fly } from "svelte/transition";
  import AlertTriangle from "./Icons/AlertTriangle.svelte";
  import ThumbsUp from "./Icons/ThumbsUp.svelte";
</script>

<style>
  .alert {
    display: flex;
    align-items: center;
    position: relative;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin: 0 auto;
    z-index: 30;
  }
  .error {
    background-color: #fff5f5;
    border: solid 1px #fc8181;
    color: #c53030;
  }

  .warning {
    background-color: #fffaf0;
    border: solid 1px #f6ad55;
    color: #c05621;
  }

  .success {
    background-color: #f0fff4;
    border: solid 1px #68d391;
    color: #2f855a;
  }

  .info {
    background-color: #ebf8ff;
    border: solid 1px #63b3ed;
    color: #2b6cb0;
  }

  .dot {
    height: 0.5rem;
    width: 0.5rem;
    display: inline-block;
    border-radius: 9999px;
    margin-right: 1rem;
  }

  .error-dot {
    background-color: #c53030;
  }

  .info-dot {
    background-color: #2b6cb0;
  }

  .warning-dot {
    background-color: #c05621;
  }

  .success-dot {
    background-color: #2f855a;
  }
</style>

{#if type === 'error'}
  <div class="alert error" role="alert">
    {#if hasDot}
      <div class="dot error-dot" />
    {/if}
    {#if hasIcon}
      <AlertTriangle color="#c53030" />
    {/if}
    {text}
  </div>
{:else if type === 'warning'}
  <div class="alert warning" role="alert">
    {#if hasDot}
      <div class="dot warning-dot" />
    {/if}
    {#if hasIcon}
      <AlertTriangle color="#c05621" />
    {/if}
    {text}
  </div>
{:else if type === 'success'}
  <div class="alert success" role="alert" out:fly={{ y: -50, duration: 200 }}>
    {#if hasDot}
      <div class="dot success-dot" />
    {/if}
    {#if hasIcon}
      <ThumbsUp color="#2f855a" />
    {/if}
    {text}
  </div>
{:else if type === 'info'}
  <div class="alert info" role="alert">
    {#if hasDot}
      <div class="dot info-dot" />
    {/if}
    {#if hasIcon}
      <AlertTriangle color="#2b6cb0" />
    {/if}
    {text}
  </div>
{/if}
