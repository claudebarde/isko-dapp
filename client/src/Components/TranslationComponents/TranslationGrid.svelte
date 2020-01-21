<script>
  import tokenizer from "sbd";
  import { onMount, createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import TranslationGridRow from "./TranslationGridRow.svelte";
  import Button from "../Button.svelte";

  export let content;
  export let previousGrid = [];

  let translationGrid = [];
  let buttonType = "disabled";
  const dispatch = createEventDispatcher();

  const updateSegment = data => {
    const { output, index, status, action } = data.detail;
    // updates grid
    const tempGrid = [...translationGrid];
    tempGrid[index] = {
      ...tempGrid[index],
      output,
      status
    };
    if (action === "save") {
      // sets focus on next segment
      if (index < translationGrid.length - 1) {
        document.getElementById(`textarea${parseInt(index) + 1}`).focus();
      }
    }
    translationGrid = [...tempGrid];
  };

  $: if (
    translationGrid.length > 0 &&
    translationGrid.map(i => i.status).reduce((a, b) => a && b)
  ) {
    buttonType = "success";
  }

  const submitJob = () => {
    // checks every segment has a translation
    dispatch("submitText", { type: "text", translationGrid });
  };

  onMount(() => {
    console.log(previousGrid);
    const options = { newline_boundaries: true, sanitize: true };
    const grid = tokenizer.sentences(content, options);
    if (grid.length === previousGrid.length) {
      // both grids have the same length
      translationGrid = [
        ...grid.map((sentence, i) => ({
          input: sentence,
          output: previousGrid[i].output,
          status: true
        }))
      ];
    } else {
      translationGrid = [
        ...grid.map(sentence => ({
          input: sentence,
          output: "",
          status: false
        }))
      ];
    }
  });
</script>

<style>
  .buttons {
    float: right;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }

  .buttons .button {
    margin: 0px 10px;
    padding: 0px;
  }

  .grid {
    margin-top: 40px;
  }
</style>

{#if translationGrid.length > 0}
  <div in:fly={{ y: -100, duration: 700, delay: 500 }} class="grid">
    {#each translationGrid as segment, index}
      <TranslationGridRow {segment} {index} on:update={updateSegment} />
    {/each}
    <div class="buttons">
      <div class="button">
        <Button
          type="error"
          text="Cancel"
          on:click={() => dispatch('cancel')} />
      </div>
      <div class="button">
        <Button type={buttonType} text="Submit" on:click={submitJob} />
      </div>
    </div>
  </div>
{/if}
