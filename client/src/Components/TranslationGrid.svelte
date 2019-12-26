<script>
  import tokenizer from "sbd";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import firebase from "firebase";
  import { push } from "svelte-spa-router";
  import TranslationGridRow from "./TranslationGridRow.svelte";
  import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";
  import web3Store from "../stores/web3-store";
  import sendTxAndWait from "../utils/sendTxAndWait";

  export let content;
  export let jobID;

  let translationGrid = [];
  let modalType = "error";
  let buttonType = "disabled";
  let cancelModal = false;
  let cancelationReason = "";
  let pendingCancelation = false;
  let cancelationError = undefined;
  let cancelationErrorMsg = "";

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

  const cancelJob = async () => {
    pendingCancelation = true;

    const {
      web3,
      contractInstance,
      currentAddress,
      contractAddress
    } = $web3Store;
    try {
      const result = await sendTxAndWait({
        web3,
        contractInstance,
        currentAddress,
        contractAddress,
        method: "cancelJob",
        methodParameters: jobID
      });
      if (result.result === "tx_included") {
        // saves cancelation in firebase
        // cancel job in firebase
        const unclaimJob = firebase.functions().httpsCallable("unclaimJob"); // generates unique id token
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        const result = await unclaimJob({
          jobID,
          idToken,
          reason: cancelationReason
        });
        if (result.data.error === false) {
          // we save the translation details
          cancelationError = false;
          modalType = "success";
          setTimeout(() => {
            push("/market");
          }, 1500);
        } else {
          if (result.data.msg) {
            throw new Error({ result: "firebase_error", errorMsg: msg });
          } else {
            throw new Error({
              result: "firebase_error",
              errorMsg:
                "An error has occurred while canceling the job on the server!"
            });
          }
        }
      } else {
        throw new Error(result);
      }
    } catch (error) {
      // if transaction did not go through
      cancelationError = true;
      switch (error.result) {
        case "subscription_failed":
          cancelationErrorMsg = "Subscription to new block headers failed";
          break;
        case "sendTransaction_failed":
          cancelationErrorMsg = "Transaction generated an error";
          break;
        case "sendTransaction_no_receipt":
          cancelationErrorMsg = "Transaction did not generate a receipt";
          break;
        case "sendTransaction_failed_catch":
          cancelationErrorMsg = "Unable to send transaction";
          break;
        case "getBlock_error":
          cancelationErrorMsg = "Unable to fetch new block headers";
          break;
        case "subscription_error":
          cancelationErrorMsg = "Unable to subscribe to new block headers";
          break;
        case "firebase_error":
          cancelationErrorMsg = "Unable to update database";
          break;
        default:
          cancelationErrorMsg = "Transaction failed";
          break;
      }
      // if error was returned
      if (error.errorMsg) cancelationErrorMsg += `: ${error.errorMsg}`;
    }
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

  .cancelation-msg .loader {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .cancelation-msg img {
    height: 24px;
    width: 24px;
    margin-right: 10px;
  }
</style>

{#if translationGrid.length > 0}
  {#if cancelModal}
    <Modal type={modalType} size="small" on:close={() => (cancelModal = false)}>
      <div slot="title">
        {#if pendingCancelation}
          {#if cancelationError === undefined}
            Pending Cancelation
          {:else if cancelationError === true}
            Cancelation Failed
          {:else if cancelationError === false}Cancelation Successful{/if}
        {:else}Cancel Translation{/if}
      </div>
      <div slot="body">
        {#if pendingCancelation}
          {#if cancelationError === undefined}
            <div class="cancelation-msg">
              <p>Cancelation in progress.</p>
              <p>
                This may take a couple of minutes, please do not refresh or
                leave the page.
              </p>
              <div class="loader">
                <div class="dot-typing" />
              </div>
            </div>
          {:else if cancelationError === true}
            <div class="cancelation-msg">
              <p>We could not cancel this translation.</p>
              {#if cancelationErrorMsg}
                <p>{cancelationErrorMsg}</p>
              {/if}
            </div>
          {:else if cancelationError === false}
            <div class="cancelation-msg">
              <p>
                <img src="images/thumbs-up.svg" alt="thumbs-up" />
                The translation was successfully canceled!
              </p>
            </div>
          {/if}
        {:else}
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
              value="Not enough time"
              bind:group={cancelationReason} />
            <label for="enough-time">I don't have enough time</label>
            <br />
            <input
              type="radio"
              name="cancelation"
              id="right-tools"
              value="No right tools"
              bind:group={cancelationReason} />
            <label for="right-tools">I don't have the right tools</label>
            <br />
            <input
              type="radio"
              name="cancelation"
              id="wrong-language"
              value="Wrong language pair"
              bind:group={cancelationReason} />
            <label for="wrong-language">The language pair is wrong</label>
            <br />
            <input
              type="radio"
              name="cancelation"
              id="inappropriate-content"
              value="Inappropriate content"
              bind:group={cancelationReason} />
            <label for="inappropriate-content">
              The content is inappropriate
            </label>
            <br />
            <input
              type="radio"
              name="cancelation"
              id="low-price"
              value="Price is too low"
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
        {/if}
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
