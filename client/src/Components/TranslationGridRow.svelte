<script>
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  export let segment;
  export let index;

  let output = segment.output;
  const dispatch = createEventDispatcher();
  let focused = false;

  const validate = event => {
    if (event.keyCode === 13 && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      dispatch("update", { output, index, status: true, action: "save" });
    }
  };

  const update = event => {
    // checks changes
    if (output !== segment.output && segment.status) {
      dispatch("update", { output, index, status: false, action: "update" });
    }
  };
</script>

<style>
  .segment {
    display: flex;
    flex-direction: segment;
    justify-content: space-between;
    background-color: #ffffff;
    border: solid 1px #cbd5e0;
    border-radius: 0.25rem;
    padding: 0px;
    margin: 10px 5px;
  }

  .segment__input,
  .segment__output {
    width: 48%;
  }

  .segment__input {
    border-right: solid 1px #cbd5e0;
    border-left: solid 6px white;
    padding: 20px;
    transition: 1000ms;
  }

  .segment__output textarea {
    height: 100%;
    width: 100%;
    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
    -moz-box-sizing: border-box; /* Firefox, other Gecko */
    box-sizing: border-box; /* Opera/IE 8+ */
    padding: 20px;
    margin: 0;
    border: none;
  }

  .segment__info {
    width: 4%;
    padding: 6px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  .segment__info img {
    height: 20px;
    width: 20px;
  }

  .focused {
    border-left: solid 6px #718096;
  }
</style>

<div class="segment">
  <div class="segment__input" class:focused>{segment.input}</div>
  <div class="segment__output">
    <textarea
      id={`textarea${index}`}
      on:keydown={validate}
      on:keyup={update}
      bind:value={output}
      on:focus={() => (focused = true)}
      on:blur={() => (focused = false)} />
  </div>
  <div class="segment__info">
    {#if segment.status}
      <img
        src="images/check-circle-success.svg"
        alt="saved"
        in:fly={{ x: 10, duration: 200, delay: 200 }}
        out:fly={{ x: -10, duration: 200 }} />
    {:else}
      <img
        src="images/x-circle-error.svg"
        alt="not saved"
        in:fly={{ x: 10, duration: 200, delay: 200 }}
        out:fly={{ x: -10, duration: 200 }} />
    {/if}
  </div>
</div>
