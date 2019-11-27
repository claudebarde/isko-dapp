<script>
  import { fly } from "svelte/transition";
  import Clock from "./Icons/Clock.svelte";
  import ThumbsUp from "./Icons/ThumbsUp.svelte";
  import AlertTriangle from "./Icons/AlertTriangle.svelte";

  export let title;
  export let text;
  export let type;
  export let icon;

  const colors = {
    info: "#2b6cb0",
    success: "#2f855a",
    warning: "#c05621"
  };
</script>

<style>
  .toast {
    position: fixed;
    bottom: 20px;
    right: 0px;
    padding: 0.5rem 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    text-align: left;
    font-size: 0.75rem;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    width: 250px;
  }

  .toast-info {
    background-color: #ebf8ff;
    border: solid 1px #63b3ed;
    border-right: none;
    color: #2b6cb0;
  }

  .toast-success {
    background-color: #f0fff4;
    border: solid 1px #68d391;
    border-right: none;
    color: #2f855a;
  }

  .toast-warning {
    background-color: #fffaf0;
    border: solid 1px #f6ad55;
    color: #c05621;
  }

  .title {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
</style>

<div
  class={`toast toast-${type}`}
  in:fly={{ x: 500, duration: 1000 }}
  out:fly={{ x: 250, duration: 1000 }}>
  <div class="title">
    {#if icon === 'clock'}
      <Clock color={colors[type]} />
    {:else if icon === 'thumbs-up'}
      <ThumbsUp color={colors[type]} />
    {:else if icon === 'alert-triangle'}
      <AlertTriangle color={colors[type]} />
    {/if}
    <h3>{title}</h3>
  </div>
  <p>{text}</p>
</div>
