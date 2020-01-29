<script>
  import moment from "moment";
  import langs from "langs";
  import firebase from "firebase";
  import { fly } from "svelte/transition";
  import { push } from "svelte-spa-router";
  import Navbar from "../../../Navbar/Navbar.svelte";
  import web3Store from "../../../stores/web3-store";
  import userStore from "../../../stores/user-store";
  import { shortenHash, fromWeiToEther } from "../../../utils/functions";
  import { sendTxAndWait } from "../../../utils/sendTxAndWait";
  import ActiveTranslationEntry from "./ActiveTranslationEntry.svelte";
  import TranslationEntry from "./TranslationEntry.svelte";
  import AlertTriangle from "../../Icons/AlertTriangle.svelte";
  import ThumbsUp from "../../Icons/ThumbsUp.svelte";
  import Modal from "../../Modal.svelte";
  import Button from "../../Button.svelte";

  let langPairFrom = undefined;
  let langPairTo = undefined;
  let requestPayoutModal = false;
  let requestPayoutSteps = "confirm"; // confirm | await_tx | await_firebase | success | error
  let requestPayoutErrorMsg = null;
  let jobID = undefined;

  const requestPayout = async () => {
    if (!jobID) {
      requestPayoutSteps = "error";
      requestPayoutErrorMsg = "Translation ID is undefined";
      return;
    }

    requestPayoutModal = true;
    const {
      web3,
      currentAddress,
      contractAddress,
      contractInstance
    } = $web3Store;
    try {
      requestPayoutSteps = "await_tx";
      const transaction = await sendTxAndWait({
        web3,
        contractInstance,
        currentAddress,
        contractAddress,
        method: "payOutJob",
        methodParameters: [jobID]
      });
      if (transaction.result === "tx_included") {
        const { txHash } = transaction;
        requestPayoutSteps = "await_firebase";
        // generates unique id token
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        // updates status in firebase database
        const requestPayout = firebase
          .functions()
          .httpsCallable("requestPayout");
        const result = await requestPayout({ jobID, idToken, txHash });
        if (result.data.error === false) {
          requestPayoutSteps = "success";
        } else {
          console.log("error!");
          throw new Error(result.data.msg || "");
        }
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      requestPayoutSteps = "error";
      requestPayoutErrorMsg = error;
    }
  };
</script>

<style>
  .withdraw-balance {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .user-translations {
    width: 100% !important;
  }

  .to-review {
    margin: 10px;
    color: #f56565;
    cursor: pointer;
  }

  .buttons {
    float: right;
    margin-top: 60px;
    display: flex;
    flex-direction: row;
  }

  .buttons .button {
    margin: 0px 10px;
    padding: 0px;
  }

  .loader {
    margin: 0 auto;
    margin-top: 30px;
  }
</style>

{#if requestPayoutModal}
  <Modal
    type={requestPayoutSteps === 'success' ? 'success' : requestPayoutSteps === 'error' ? 'error' : 'info'}
    size="small"
    on:close={() => (requestPayoutModal = false)}>
    <div slot="title">
      {#if requestPayoutSteps === 'confirm'}
        Confirm Payout Request
      {:else if requestPayoutSteps === 'await_tx'}
        Status Update Pending
      {:else if requestPayoutSteps === 'await_firebase'}
        Status Update Pending
      {:else if requestPayoutSteps === 'success'}
        Request Successful!
      {:else if requestPayoutSteps === 'error'}Error{/if}
    </div>
    <div slot="body">
      {#if requestPayoutSteps === 'confirm'}
        <div class="modal__body__content">
          Are you sure you want to request a pay out for this translation?
        </div>
        <div class="buttons">
          <div class="button">
            <Button
              type={requestPayoutSteps === 'confirm' ? 'warning' : 'disabled'}
              text="Cancel"
              on:click={() => (requestPayoutModal = false)} />
          </div>
          <div class="button">
            <Button
              type={requestPayoutSteps === 'confirm' ? 'success' : 'disabled'}
              text="Confirm"
              on:click={requestPayout} />
          </div>
        </div>
      {:else if requestPayoutSteps === 'await_tx'}
        <div class="modal__body__content">
          <div>
            Your pay out request is being registered on the blockchain, please
            wait and do not close or refresh this page.
          </div>
          <div class="dot-typing loader" />
        </div>
      {:else if requestPayoutSteps === 'await_firebase'}
        <div class="modal__body__content">
          <div>
            Your pay out request is now being saved in your account, this should
            only take a few seconds, please wait.
          </div>
          <div class="dot-typing loader" />
        </div>
      {:else if requestPayoutSteps === 'success'}
        <div class="modal__body__content">
          <div>
            Your request has been successfully saved and the funds are now
            available on your account for withdrawal.
          </div>
          <div style="text-align:center">
            <ThumbsUp />
          </div>
        </div>
      {:else if requestPayoutSteps === 'error'}
        <div class="modal__body__content">
          An error has occured{requestPayoutErrorMsg ? `: ${requestPayoutErrorMsg}` : ''}.
          Please try again
        </div>
      {/if}
    </div>
  </Modal>
{/if}
{#if $userStore.info}
  <div class="account-container" in:fly={{ y: -100, duration: 500 }}>
    <div class="account-card">
      <div class="account-card__content">
        <div>Name</div>
        <div>
          {`${$userStore.info.firstname} ${$userStore.info.lastname}`}
          <img src="images/edit.svg" alt="add" class="external-link" />
        </div>
      </div>
      <div class="account-card__content">
        <div>User ID</div>
        <div>
          {shortenHash($userStore.info.uid)}
          <a
            href={`https://etherscan.io/address/${$userStore.info.uid}`}
            target="_blank"
            rel="noopener noreferrer">
            <img
              src="images/external-link.svg"
              alt="external-link"
              class="external-link" />
          </a>
        </div>
      </div>
      <div class="account-card__content">
        <div>Email address</div>
        <div>{$userStore.info.email}</div>
      </div>
      <div class="account-card__content">
        <div>Current Balance</div>
        {#if $web3Store.web3 && $userStore.balance}
          <div class="withdraw-balance">
            {`${$web3Store.web3.utils.fromWei($userStore.balance, 'ether')} ether`}
            <img
              src="images/download.svg"
              alt="withdraw"
              class="external-link"
              title="Withdraw" />
          </div>
        {:else}
          <div>Loading...</div>
        {/if}
      </div>
      <div class="account-card__content">
        <div>Withdrawal History</div>
        {#if $userStore.info.withdrawals.length === 0}
          No withdrawal
        {:else}Open History{/if}
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content">
        <div>Account Creation</div>
        <div>
          {moment($userStore.info.creation).format('MMM Do YYYY, h:mm:ss a')}
        </div>
      </div>
      <div class="account-card__content">
        <div>Creation Transaction</div>
        <div>
          {shortenHash($userStore.info.signupTxHash)}
          <a
            href={`https://etherscan.io/tx/${$userStore.info.signupTxHash}`}
            target="_blank"
            rel="noopener noreferrer">
            <img
              src="images/external-link.svg"
              alt="external-link"
              class="external-link" />
          </a>
        </div>
      </div>
      <div class="account-card__content">
        <div>Language Pair</div>
        <div>
          {`${langs.where('3', $userStore.info.languagePairs[0].from).name} => ${langs.where('3', $userStore.info.languagePairs[0].to).name}`}
        </div>
      </div>
      <div class="account-card__content">
        <div>Number of translations</div>
        <div>{$userStore.info.numberOfTranslations}</div>
      </div>
      <div class="account-card__content" style="text-align:right">
        <div>Feedbacks</div>
        {#if Object.keys($userStore.info.feedbacks).length < 5}
          <span class="no-feedback">
            Min. 5 feedbacks required
            <br />
            (currently {Object.keys($userStore.info.feedbacks).length})
          </span>
        {:else}
          <div>
            Note: {Object.keys($userStore.info.feedbacks)
              .map(jobID => $userStore.info.feedbacks[jobID].note)
              .reduce((a, b) => a + b) / Object.keys($userStore.info.feedbacks).length}
          </div>
        {/if}
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content" style="width:100%">
        <div class="user-translations">
          <p>Active Translations</p>
          {#each Object.keys($userStore.info.activeTranslations) as transl}
            <ActiveTranslationEntry
              translHash={transl}
              transl={$userStore.info.activeTranslations[transl]}
              web3={$web3Store.web3} />
          {:else}
            <div>No active translation</div>
          {/each}
        </div>
      </div>
      <div class="account-card__content">
        <div class="user-translations">
          <div>Translations to Review</div>
          {#each $userStore.info.translationsToReview as transl}
            <div
              class="to-review"
              on:click={() => push(`/translate/${transl}`)}>
              <AlertTriangle color="#f56565" />
              {transl}
            </div>
          {:else}
            <p>No translation to review</p>
          {/each}
        </div>
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content">
        <div class="user-translations">
          <div>Pending Translations</div>
          {#each Object.keys($userStore.info.pendingTranslations) as transl}
            <TranslationEntry
              translHash={transl}
              transl={$userStore.info.pendingTranslations[transl]}
              web3={$web3Store.web3}
              type="pending"
              on:requestPayout={event => {
                jobID = event.detail;
                requestPayoutModal = true;
              }} />
          {:else}
            <p>No pending translation</p>
          {/each}
        </div>
      </div>
      <div class="account-card__content">
        <div class="user-translations">
          <div>Paid Out Translations</div>
          {#each Object.keys($userStore.info.paidOutTranslations) as transl}
            <TranslationEntry
              translHash={transl}
              transl={$userStore.info.paidOutTranslations[transl]}
              web3={$web3Store.web3}
              type="paidout" />
          {:else}
            <p>No paidOut translation</p>
          {/each}
        </div>
      </div>
    </div>
  </div>
{:else}
  <div>Loading info</div>
{/if}
