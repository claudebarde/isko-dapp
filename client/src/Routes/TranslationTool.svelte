<script>
  import { onMount, afterUpdate } from "svelte";
  import { fly, slide } from "svelte/transition";
  import firebase from "firebase";
  import moment from "moment";
  import { push } from "svelte-spa-router";
  import uuidv4 from "uuid/v4";
  import Navbar from "../Navbar/Navbar.svelte";
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import eventsStore from "../stores/events-store";
  import { upperFirst, fromWeiToEther } from "../utils/functions";
  import Alert from "../Components/Alert.svelte";
  import TranslationGrid from "../Components/TranslationComponents/TranslationGrid.svelte";
  import TranslationFile from "../Components/TranslationComponents/TranslationFile.svelte";
  import TranslationHeader from "../Components/TranslationComponents/TranslationHeader.svelte";
  import TranslationComments from "../Components/TranslationComponents/TranslationComments.svelte";
  import Button from "../Components/Button.svelte";
  import Modal from "../Components/Modal.svelte";
  import { sendTxAndWait, errorMessage } from "../utils/sendTxAndWait";
  import { jobStatuses } from "../utils/utils";

  export let params = {};
  let loading = true;
  let loadingSubmit = false;
  let wrongSmStatus = false;
  let jobID = undefined;
  let translFetched = false;
  let translationDetails = { supportType: "" };
  let smContractInfo = undefined;
  let modalType = "error";
  let cancelModal = false;
  let cancelationReason = "";
  let pendingCancelation = false;
  let cancelationError = undefined;
  let cancelationErrorMsg = "";
  let submitTransModal = false;
  let pendingSubmitTransTx = true;
  let pendingSubmitTransAccount = false;
  let pendingSubmitTransSuccess = false;
  let pendingSubmitTransError = false;
  let pendingSubmitTransErrorMessage = "";
  let submitTransModalType = "info";

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

  const submitTranslation = async event => {
    submitTransModal = true;
    loadingSubmit = true;
    let data = { ...event.detail };
    // updating translation status in the blockchain
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
        method: "deliverJob",
        methodParameters: [jobID]
      });
      //const result = { result: "tx_included" };
      if (result.result === "tx_included") {
        // if file is sent
        if (data.type === "file") {
          data = { ...data, fileName: uuidv4() };
          // uploads file first before saving job
          // creates reference to storage
          const storage = firebase.storage().ref();
          // creates file reference
          const ref = storage.child(
            `${translationDetails.content.folder}/delivered/${data.fileName}`
          );
          // uploads file
          const snapshot = await ref.put(data.file.file);
          //console.log(snapshot);
          if (snapshot.state !== "success")
            throw new Error("Couldn't upload the file!");
          delete data.file;
        } else if (data.type === "text") {
          // status property in segment is useless
          data.translationGrid.forEach(segment => {
            delete segment.status;
          });
        } else {
          throw new Error("Unexpected translation type");
        }
        // if transaction was included, we send the file or text and update the translation in firebase
        pendingSubmitTransTx = false;
        pendingSubmitTransAccount = true;
        // if everything is OK, we update database
        const submitCompletedTranslation = firebase
          .functions()
          .httpsCallable("submitCompletedTranslation"); // generates unique id token
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        const result = await submitCompletedTranslation({
          jobID,
          idToken,
          ...data
        });
        //console.log(result);
        if (result.data.error === false) {
          loading = false;
          pendingSubmitTransTx = false;
          pendingSubmitTransAccount = false;
          pendingSubmitTransError = false;
          loadingSubmit = false;
          pendingSubmitTransSuccess = true;
          setTimeout(() => {
            submitTransModal = false;
            push("/market");
          }, 1500);
        } else {
          if (result.data.msg) {
            throw new Error({ result: "firebase_error", errorMsg: msg });
          } else {
            throw new Error({
              result: "firebase_error",
              errorMsg:
                "An error has occurred while saving the job on the server!"
            });
          }
        }
      } else {
        throw new Error(result);
      }
    } catch (error) {
      console.log(error);
      // if transaction did not go through
      loadingSubmit = false;
      pendingSubmitTransTx = false;
      pendingSubmitTransAccount = false;
      pendingSubmitTransError = true;
      pendingSubmitTransErrorMessage = errorMessage(error);
      // if error was returned
      if (error.errorMsg) {
        pendingSubmitTransErrorMessage += `: ${error.errorMsg}`;
      } else if (error.message) {
        pendingSubmitTransErrorMessage += `: ${error.message}`;
      }
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
        loading = false;
        eventsStore.toggleWarningModal(
          "An error has occurred while fetching the job!"
        );
      }
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
    // displays warning message to translator if translation doesnt have "accepted" status
    if (
      smContractInfo &&
      parseInt(smContractInfo.status) > 1 &&
      !!translationDetails.timestamp &&
      !wrongSmStatus
    ) {
      wrongSmStatus = true;
      eventsStore.toggleWarningModal(
        `<p>This translation doesn't have the proper status on the blockchain.</p><p>If you continue, you may not be paid for this job!</p><p>Please contact customer service with the reference number, thank you.</p><p>Ref: ${jobID}</p>`
      );
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

  h4 {
    text-align: left;
    margin: 20px 0px;
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

  .submit-file-loader {
    margin: 0 auto;
    width: 0%;
    padding-top: 10px;
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
{#if submitTransModal}
  <Modal
    type={submitTransModalType}
    size="small"
    on:close={() => (submitTransModal = false)}>
    <div slot="title">Submit Translation</div>
    <div slot="body">
      {#if pendingSubmitTransTx}
        <p>
          The translation status is being updated on the blockchain, please
          wait.
        </p>
        <p>
          This may take a couple of minutes, do not close or refresh this page.
        </p>
      {:else if pendingSubmitTransAccount}
        <p>
          The translation status has been successfully updated on the
          blockchain!
        </p>
        <p>
          The translation is now being saved in your account, please wait, do
          not close or refresh this page.
        </p>
      {:else if pendingSubmitTransSuccess}
        <p>Your translation has been successfully submitted!</p>
        <p>Thank you for your collaboration.</p>
        <p>
          <img src="images/thumbs-up.svg" alt="thumbs-up" />
        </p>
      {:else if pendingSubmitTransError}
        <p>An error has occurred, please try again later.</p>
      {/if}
      {#if loadingSubmit}
        <div class="submit-file-loader">
          <div class="dot-typing" />
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
      <TranslationHeader
        {jobID}
        {translationDetails}
        {smContractInfo}
        web3={$web3Store.web3} />
      <div class="job-body">
        {#if translationDetails.supportType}
          <div in:slide={{ y: 100, duration: 500 }} style="width: 100%">
            <TranslationComments
              comments={translationDetails.comments}
              {jobID}
              on:new-comment={event => (translationDetails.comments = [...translationDetails.comments, event.detail])} />
            {#if translationDetails.supportType === 'text'}
              <TranslationGrid
                content={translationDetails.content}
                on:cancel={() => (cancelModal = true)}
                on:submitText={submitTranslation} />
            {:else}
              <TranslationFile
                content={translationDetails.content}
                {smContractInfo}
                on:cancel={() => (cancelModal = true)}
                on:submitFile={submitTranslation} />
            {/if}
          </div>
        {:else if loading}
          <div class="loading-transl">
            <p>Loading translation</p>
            <div class="dot-typing" />
          </div>
        {:else}
          <p>You are not allowed to view this translation.</p>
        {/if}
      </div>
    {/if}
  </div>
</main>
