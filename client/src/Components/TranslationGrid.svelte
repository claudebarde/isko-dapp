<script>
  import tokenizer from "sbd";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import TranslationGridRow from "./TranslationGridRow.svelte";
  import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";
  import web3Store from "../stores/web3-store";
  import sendTxAndWait from "../utils/sendTxAndWait";

  export let content;
  export let jobID;

  let translationGrid = [];
  let buttonType = "disabled";
  let cancelModal = false;
  let cancelationReason = "";

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

  const cancelJob = () => {
    sendTxAndWait();
  };

  onMount(() => {
    const options = { newline_boundaries: true, sanitize: true };
    translationGrid = [...tokenizer.sentences(content, options)].map(
      sentence => ({ input: sentence, output: "", status: false })
    );
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
  {#if cancelModal}
    <Modal type="error" size="small" on:close={() => (cancelModal = false)}>
      <div slot="title">Cancel Translation</div>
      <div slot="body">
        <p>
          Are you sure you want to cancel this translation?
          <br />
          This will incur non-refundable gas fees.
        </p>
        <div>
          <p>Please give a reason for your cancelation:</p>
          <input
            type="radio"
            name="cancelation"
            id="enough-time"
            value="enough-time"
            bind:group={cancelationReason} />
          <label for="enough-time">I don't have enough time</label>
          <br />
          <input
            type="radio"
            name="cancelation"
            id="right-tools"
            value="right-tools"
            bind:group={cancelationReason} />
          <label for="right-tools">I don't have the right tools</label>
          <br />
          <input
            type="radio"
            name="cancelation"
            id="wrong-language"
            value="wrong-language"
            bind:group={cancelationReason} />
          <label for="wrong-language">The language pair is wrong</label>
          <br />
          <input
            type="radio"
            name="cancelation"
            id="inappropriate-content"
            value="inappropriate-content"
            bind:group={cancelationReason} />
          <label for="inappropriate-content">
            The content is inappropriate
          </label>
          <br />
          <input
            type="radio"
            name="cancelation"
            id="low-price"
            value="low-price"
            bind:group={cancelationReason} />
          <label for="low-price">The price is too low</label>
          <br />
          <div class="buttons">
            <div class="button">
              <Button
                type={cancelationReason ? 'error' : 'disabled'}
                text="Confirm"
                on:click={cancelJob} />
            </div>
            <div class="button">
              <Button
                type="info"
                text="Abort Cancelation"
                on:click={() => (cancelModal = false)}
                } />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  {/if}
  <div in:fly={{ y: -100, duration: 700, delay: 500 }} class="grid">
    {#each translationGrid as segment, index}
      <TranslationGridRow {segment} {index} on:update={updateSegment} />
    {/each}
    <div class="buttons">
      <div class="button">
        <Button
          type="error"
          text="Cancel"
          on:click={() => (cancelModal = true)} />
      </div>
      <div class="button">
        <Button type={buttonType} text="Submit" />
      </div>
    </div>
  </div>
{/if}
