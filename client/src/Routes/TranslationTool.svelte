<script>
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { fly, slide } from "svelte/transition";
  import firebase from "firebase";
  import moment from "moment";
  import { push } from "svelte-spa-router";
  import Navbar from "../Navbar/Navbar.svelte";
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import eventsStore from "../stores/events-store";
  import { shortenHash, upperFirst, fromWeiToEther } from "../utils/functions";
  import Tag from "../Components/Tag.svelte";
  import Alert from "../Components/Alert.svelte";
  import TranslationGrid from "../Components/TranslationGrid.svelte";
  import TranslationFile from "../Components/TranslationFile.svelte";
  import Button from "../Components/Button.svelte";
  import Modal from "../Components/Modal.svelte";
  import { sendTxAndWait, errorMessage } from "../utils/sendTxAndWait";

  export let params = {};
  let jobID = undefined;
  let translFetched = false;
  let translationDetails = { supportType: "" };
  let smContractInfo = undefined;
  let dueTime = 0;
  let dueTimeInterval = undefined;
  let newComment = "";
  let openNewComment = false;
  let disableNewComment = false;
  let modalType = "error";
  let cancelModal = false;
  let cancelationReason = "";
  let pendingCancelation = false;
  let cancelationError = undefined;
  let cancelationErrorMsg = "";

  const validateComment = async event => {
    if (event.keyCode === 13) {
      disableNewComment = true;
      const comment = {
        from: "translator",
        timestamp: Date.now(),
        text: newComment
      };
      newComment = "Saving...";
      event.preventDefault();
      try {
        // save new comment in database
        const addComment = firebase.functions().httpsCallable("addComment"); // generates unique id token
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        const result = await addComment({
          jobID,
          comment,
          idToken
        });
        if (result.data.error === false) {
          // updates local comments
          let comments = [...translationDetails.comments];
          comments.push(comment);
          translationDetails = { ...translationDetails, comments };
          newComment = "";
          disableNewComment = false;
          openNewComment = false;
        } else {
          throw new Error(result.data.msg);
        }
      } catch (error) {
        console.log(error);
        eventsStore.toggleWarningModal(
          "An error has occurred while saving your comment!"
        );
      }
    }
  };

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
        methodParameters: [jobID]
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
      console.log(error);
      // if transaction did not go through
      cancelationError = true;
      cancelationErrorMsg = errorMessage(result.error);
      // if error was returned
      if (error.errorMsg) cancelationErrorMsg += `: ${error.errorMsg}`;
    }
  };

  onMount(async () => {
    // checks if job id has been provided
    if (params.id) {
      jobID = params.id;
    } else {
      jobID = undefined;
    }
  });

  onDestroy(() => clearInterval(dueTimeInterval));

  afterUpdate(async () => {
    if (!translFetched && $userStore.info) {
      try {
        // fetches translation from firebase
        const fetchTranslation = firebase
          .functions()
          .httpsCallable("fetchTranslation"); // generates unique id token
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        const result = await fetchTranslation({ jobID, idToken });
        if (result.data.error === false) {
          // we save the translation details
          translationDetails = { ...result.data };
          delete translationDetails.error;
        } else {
          if (result.data.msg) {
            throw new Error(result.data.msg);
          } else {
            throw new Error("An error has occurred while fetching the job!");
          }
        }
      } catch (err) {
        console.log(err);
        eventsStore.toggleWarningModal(
          "An error has occurred while fetching the job!"
        );
      }
      /*setTimeout(() => {
        translationDetails = {
          comments: [
            { text: "test", timestamp: 1577022469852, from: "customer" }
          ],
          content:
            "ethereum.autoRefreshOnNetworkChange (To Be Removed) \nThis will be removed on January 13, 2020. At this time, MetaMask will also stop reloading the page on network changes. Click here for more details.\n\nWhen the network is changed, MetaMask will reload any pages that have made requests to the provider. This automatic reload behavior will be removed in a future release of MetaMask, but in the meantime it can be disabled with this flag.\n\nTo disable auto-refresh on a network change you can do:\n\nethereum.autoRefreshOnNetworkChange = false;\nThis can be toggled on or off at any time.\n\nNote: Setting this flag to true results in the default behavior, which is subject to change. If your site relies upon MetaMask reloading it upon network change, you will need to trigger the reload yourself in a networkChanged event handler to ensure it continues to work with future releases.\n\nethereum.on(eventName, callback) \nThe provider supports listening for some events:\n\naccountsChanged, returns updated account array.\nnetworkChanged, returns network ID string.\nExample ",
          contentType: "Generic Content",
          duedate: 86400,
          extraQuality: false,
          fromLang: "eng",
          toLang: "fra",
          jobType: "translation",
          price: 42660000000000000,
          supportType: "text",
          timestamp: 1577022487748,
          status: "waiting"
        };
      }, 1500);*/
      translFetched = true;
    }
    // fetches info from blockchain
    if ($web3Store.web3 && jobID && smContractInfo === undefined) {
      try {
        const job = await $web3Store.contractInstance.methods
          .jobs(jobID)
          .call();
        smContractInfo = { ...job };
      } catch (error) {
        console.log(error);
      }
    }
    // sets interval to refresh due time
    if (translationDetails.timestamp) {
      dueTime = moment(
        parseInt(translationDetails.timestamp) +
          parseInt(translationDetails.duedate * 1000)
      ).fromNow();
      dueTimeInterval = setInterval(() => {
        dueTime = moment(
          parseInt(translationDetails.timestamp) +
            parseInt(translationDetails.duedate * 1000)
        ).fromNow();
      }, 60000);
    }
  });
</script>

<style>
  main {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
  }
  .transl-body {
    width: 95%;
    padding: 20px;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  h3,
  h4 {
    text-align: left;
    margin: 20px 0px;
  }

  .title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .job-body {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .loading-transl {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .comment {
    margin: 4px;
  }

  .add-comment {
    margin: 10px;
    cursor: pointer;
  }

  .add-comment img {
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }

  .rotate {
    -ms-transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  .no-rotate {
    -ms-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  .new-comment-container {
    margin: 0px;
    margin-left: 20px;
  }

  .new-comment-container textarea {
    width: 30%;
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

  .modal-buttons {
    float: right;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }

  .modal-buttons .button {
    margin: 0px 10px;
    padding: 0px;
  }
</style>

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
              This may take a couple of minutes, please do not refresh or leave
              the page.
            </p>
            <div class="loader">
              <div class="dot-typing" />
            </div>
          </div>
        {:else if cancelationError === true}
          <div class="cancelation-msg">
            <p>This translation could not be canceled.</p>
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
          <input
            type="radio"
            name="cancelation"
            id="other"
            value="Other reason"
            bind:group={cancelationReason} />
          <label for="other">Other reason</label>
          <br />
          <div class="modal-buttons">
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
<main>
  <div class="transl-body">
    {#if !jobID}
      <!-- if no job id provided -->
      <h4>No translation id has been provided.</h4>
    {:else}
      <div class="title">
        <h3>Translation #{shortenHash(jobID)}</h3>
        {#if translationDetails.supportType && smContractInfo}
          <div in:fly={{ x: 100, duration: 500 }}>
            <Tag
              type="info"
              text={`${translationDetails.fromLang}=>${translationDetails.toLang}`} />
            {#if translationDetails.extraQuality}
              <Tag type="info" text="Extra Quality" />
            {:else}
              <Tag type="info" text="Standard" />
            {/if}
            <Tag type="info" text={translationDetails.contentType} />
            <Tag type="warning" text={`Due ${dueTime}`} />
            <Tag
              type="success"
              text={`Ξ ${smContractInfo.price ? fromWeiToEther($web3Store.web3, smContractInfo.price) : '...'}`} />
          </div>
        {/if}
      </div>
      <div class="job-body">
        {#if translationDetails.supportType}
          <div in:slide={{ y: 100, duration: 500 }} style="width: 100%">
            {#if translationDetails.comments && translationDetails.comments.length > 0}
              <div class="comments">
                {#each translationDetails.comments as comment}
                  <p class="comment">
                    Comment from {comment.from}:
                    <em>"{comment.text}"</em>
                  </p>
                  <p class="comment" style="font-size:0.7rem">
                    ({moment(comment.timestamp).format('MMM Do YYYY, h:mm:ss a')})
                  </p>
                {/each}
              </div>
            {/if}
            <div
              class="add-comment"
              on:click={() => (openNewComment = !openNewComment)}>
              <img
                src="images/chevron-right.svg"
                alt="chevron right"
                id="comment-chevron"
                class={openNewComment ? 'rotate' : 'no-rotate'} />
              Add a comment
            </div>
            {#if openNewComment}
              <div
                transition:slide={{ x: 100, duration: 500 }}
                class="new-comment-container">
                <textarea
                  rows="2"
                  placeholder="Enter your comment here..."
                  maxlength="200"
                  disabled={disableNewComment}
                  on:keydown={validateComment}
                  bind:value={newComment} />
              </div>
            {/if}
            {#if translationDetails.supportType === 'text'}
              <TranslationGrid
                content={translationDetails.content}
                on:cancel={() => (cancelModal = true)} />
            {:else}
              <TranslationFile
                content={translationDetails.content}
                on:cancel={() => (cancelModal = true)} />
            {/if}
          </div>
        {:else}
          <div class="loading-transl">
            <p>Loading translation</p>
            <div class="dot-typing" />
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>
