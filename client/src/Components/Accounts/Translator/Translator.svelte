<script>
  import moment from "moment";
  import langs from "langs";
  import { fly } from "svelte/transition";
  import { push } from "svelte-spa-router";
  import Navbar from "../../../Navbar/Navbar.svelte";
  import web3Store from "../../../stores/web3-store";
  import userStore from "../../../stores/user-store";
  import { shortenHash, fromWeiToEther } from "../../../utils/functions";
  import ActiveTranslationEntry from "./ActiveTranslationEntry.svelte";
  import PendingTranslationEntry from "./PendingTranslationEntry.svelte";
  import AlertTriangle from "../../Icons/AlertTriangle.svelte";

  let langPairFrom = undefined;
  let langPairTo = undefined;

  const addNewLangPair = () => {
    if (langPairFrom && langPairTo && langPairFrom !== langPairTo) {
      userStore.updateAccountInfo({
        ...$userStore.info,
        languagePairs: [
          ...$userStore.info.languagePairs,
          { from: langPairFrom, to: langPairTo }
        ]
      });
      console.log(langPairFrom, langPairTo);
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
</style>

{#if $userStore.info}
  <div class="account-container" in:fly={{ y: -100, duration: 500 }}>
    <div class="account-card">
      <div class="account-card__content">
        <div>Name</div>
        <div>{`${$userStore.info.firstname} ${$userStore.info.lastname}`}</div>
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
        <div>Number of translations</div>
        <div>{$userStore.info.numberOfTranslations}</div>
      </div>
      <div class="account-card__content">
        <div>Feedbacks</div>
        {#if $userStore.info.feedbacks.length <= 5}
          Min. 5 feedbacks required
        {:else}
          <div>
            Note: {$userStore.info.feedbacks
              .map(feedback => feedback.note)
              .reduce((a, b) => a + b) / $userStore.info.feedbacks.length}/5
          </div>
        {/if}
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content">
        <div>Language Pair</div>
        <div>
          {`${langs.where('3', $userStore.info.languagePairs[0].from).name} => ${langs.where('3', $userStore.info.languagePairs[0].to).name}`}
        </div>
      </div>
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
          <div>Pending Translations</div>
          {#each Object.keys($userStore.info.pendingTranslations) as transl}
            <PendingTranslationEntry
              translHash={transl}
              transl={$userStore.info.pendingTranslations[transl]}
              web3={$web3Store.web3} />
          {:else}
            <p>No pending translation</p>
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
        <div>Email address</div>
        <div>{$userStore.info.email}</div>
      </div>
      <div class="account-card__content">
        <div>Update name</div>
        <div>
          {`${$userStore.info.firstname} ${$userStore.info.lastname}`}
          <img src="images/edit.svg" alt="add" class="external-link" />
        </div>
      </div>
    </div>
  </div>
{:else}
  <div>Loading info</div>
{/if}
