<script>
  import firebase from "firebase";
  import { onMount, afterUpdate } from "svelte";
  import { push } from "svelte-spa-router";
  import TranslationHeader from "../Components/TranslationComponents/TranslationHeader.svelte";
  import TranslationComments from "../Components/TranslationComponents/TranslationComments.svelte";
  import Button from "../components/Button.svelte";
  import Modal from "../components/Modal.svelte";
  import ThumbsUp from "../components/Icons/ThumbsUp.svelte";
  import userStore from "../stores/user-store";
  import eventsStore from "../stores/events-store";
  import web3Store from "../stores/web3-store";
  import { buildFinalTranslation } from "../utils/functions";
  import { sendTxAndWait } from "../utils/sendTxAndWait";

  export let params = {};

  let jobID = 0;
  let loading = true;
  let translationDetails = { supportType: "" };
  let smContractInfo = undefined;
  let reviewEnabled = false;
  let openConfirmReviewModal = false;
  let reviewSteps = "confirm"; // confirm | await_tx | await_firebase | success | error
  let fetchingError = false;

  const sendReviewRequest = async () => {
    const {
      web3,
      contractInstance,
      contractAddress,
      currentAddress
    } = $web3Store;
    // sets the translation status to "Review" on the blockchain
    try {
      reviewSteps = "await_tx";
      const reviewJob = await sendTxAndWait({
        web3,
        contractInstance,
        currentAddress,
        contractAddress,
        value: 0,
        method: "reviewJob",
        methodParameters: [jobID]
      });
      if (reviewJob.result === "tx_included") {
        // generates unique id token
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        // updates status in firebase database
        const requestReview = firebase
          .functions()
          .httpsCallable("requestReview");
        reviewSteps = "await_firebase";
        const result = await requestReview({ jobID, idToken });
        if (result.data.error === false) {
          // success!
          reviewSteps = "success";
          // update job status in store
          userStore.updateAccountInfo({
            ...$userStore.info,
            jobs: $userStore.info.jobs.map(job => {
              if (job.id === jobID) {
                return { ...job, status: "review" };
              } else {
                return job;
              }
            })
          });
          setTimeout(() => push("/account"), 3000);
        } else {
          throw new Error("Status update in database has failed !");
        }
      } else {
        throw new Error("Transaction has failed!");
      }
    } catch (error) {
      console.log(error);
      errorMsg = error;
      reviewSteps = "error";
    }
  };

  onMount(() => {
    jobID = params.id;
    // fetches job from firebase
  });

  afterUpdate(async () => {
    if (loading && $userStore.info) {
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
        fetchingError = true;
        loading = false;
        eventsStore.toggleWarningModal(
          "An error has occurred while fetching the job!<br /><br />" +
            err.toString()
        );
      }
      loading = false;
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
  });
</script>

<style>
  .no-access {
    width: 60%;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  .picture {
    width: 50%;
    margin-bottom: 40px;
  }

  main {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
  }

  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    text-align: center;
    width: 40%;
  }

  .review-body {
    width: 95%;
    padding: 20px;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .translation-output {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .translation-output__original,
  .translation-output__translation {
    width: 50%;
    padding: 10px 20px;
  }

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

  .review-instructions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    border-top: solid 1px #cbd5e0;
    margin-bottom: 30px;
  }

  .review-instructions div {
    width: 50%;
    padding: 10px 20px 0px 20px;
    text-align: left;
  }

  .text {
    margin: 10px 0px;
  }

  .loader {
    margin: 0 auto;
    margin-top: 30px;
  }
</style>

{#if fetchingError}
  <main>
    <div class="no-access">
      <img src="images/undraw_ethereum.svg" alt="ethereum" class="picture" />
      <p>You don't have access to this job, sorry!</p>
    </div>
  </main>
{:else}
  {#if $userStore.isUserConnected === undefined}
    Loading your profile...
  {:else if $userStore.isUserConnected === false}
    <main>
      <div class="no-access">
        <img src="images/undraw_ethereum.svg" alt="ethereum" class="picture" />
        <p>You must be logged in to review a job!</p>
      </div>
    </main>
  {:else}
    {#if openConfirmReviewModal}
      <Modal
        type={reviewSteps === 'success' ? 'success' : reviewSteps === 'error' ? 'error' : 'info'}
        size="small"
        on:close={() => (openConfirmReviewModal = false)}>
        <div slot="title">
          {#if reviewSteps === 'confirm'}
            Confirm Review Request
          {:else if reviewSteps === 'await_tx'}
            Status Update Pending
          {:else if reviewSteps === 'await_firebase'}
            Status Update Pending
          {:else if reviewSteps === 'success'}
            Request Successful!
          {:else if reviewSteps === 'error'}Error{/if}
        </div>
        <div slot="body">
          {#if reviewSteps === 'confirm'}
            <div class="text">
              Are you sure you want to ask for a review of the translation?
            </div>
            <div class="buttons">
              <div class="button">
                <Button
                  type="success"
                  text="Cancel"
                  on:click={() => (openConfirmReviewModal = false)} />
              </div>
              <div class="button">
                <Button
                  type="warning"
                  text="Confirm"
                  on:click={sendReviewRequest} />
              </div>
            </div>
          {:else if reviewSteps === 'await_tx'}
            <div class="text">
              The request is being processed by the Ethereum network.
            </div>
            <div class="text">
              This may take a couple minutes, please do not refresh, close or
              leave the page.
            </div>
            <div class="dot-typing loader" />
          {:else if reviewSteps === 'await_firebase'}
            <div class="text">Transation successful!</div>
            <div class="text">Your account is being updated.</div>
            <div class="text">Please wait.</div>
            <div class="dot-typing loader" />
          {:else if reviewSteps === 'success'}
            <div class="text">Your review request has been saved!</div>
            <div class="text">
              The translator will review the translation according to your
              comments as soon as possible.
            </div>
            <div style="text-align:center">
              <ThumbsUp />
            </div>
          {:else if reviewSteps === 'error'}
            <div class="text">An error has occurred.</div>
            <div class="text">Error message: {errorMsg}</div>
          {/if}
        </div>
      </Modal>
    {/if}
    <main>
      {#if loading}
        <div class="loading">
          <div>Loading, please wait</div>
          <br />
          <div class="dot-typing" />
        </div>
      {:else}
        <div class="review-body">
          {#if !jobID && !translationDetails.supportType}
            <!-- if no job id provided -->
            <h4>No translation details have been provided.</h4>
          {:else}
            <TranslationHeader
              {jobID}
              {translationDetails}
              {smContractInfo}
              web3={$web3Store.web3} />
            <TranslationComments
              comments={translationDetails.comments}
              {jobID}
              on:new-comment={event => {
                translationDetails.comments = [...translationDetails.comments, event.detail];
                reviewEnabled = true;
              }} />
            {#if translationDetails.supportType === 'text'}
              <div class="translation-output">
                <div class="translation-output__original">
                  {translationDetails.content}
                </div>
                <div class="translation-output__translation">
                  {buildFinalTranslation(translationDetails.deliveredTranslation, translationDetails.content)}
                </div>
              </div>
            {:else}Translation File{/if}
          {/if}
          <div class="review-instructions">
            <div>
              If you are not satisfied with the translation, please enter a
              comment for the translator and click on the "Ask for Review"
              button.
            </div>
            <div>
              A request for review updates the translation status on chain and
              incurs gas expenses.
            </div>
          </div>
          <div class="buttons">
            <div class="button">
              <Button
                type={reviewEnabled ? 'warning' : 'disabled'}
                text="Ask for Review"
                on:click={() => (openConfirmReviewModal = true)} />
            </div>
            <div class="button">
              <Button type="success" text="Approve" />
            </div>
          </div>
        </div>
      {/if}
    </main>
  {/if}
{/if}
