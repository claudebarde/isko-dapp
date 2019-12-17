<script>
  import moment from "moment";
  import langs from "langs";
  import { fly } from "svelte/transition";
  import Navbar from "../../../Navbar/Navbar.svelte";
  import web3Store from "../../../stores/web3-store";
  import userStore from "../../../stores/user-store";
  import { shortenHash } from "../../../utils/functions";

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

  .lang-pair-choice {
    margin: 0;
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .lang-pair-choice select {
    margin-left: 5px;
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
        <div>Language Pairs</div>
        <div>{$userStore.info.languagePairs.length}</div>
      </div>
      {#if $userStore.info.languagePairs.length > 0}
        <div class="account-card__content">
          {#each $userStore.info.languagePairs as item}
            <span>
              {`${langs.where('3', item.from).name} => ${langs.where('3', item.to).name}`}
            </span>
          {/each}
        </div>
      {/if}
      <div class="account-card__content">
        <div>Add a language pair</div>
        <div>
          <p class="lang-pair-choice">
            From
            <select name="from" id="from" bind:value={langPairFrom}>
              {#each langs.all() as item}
                <option value={item[3]}>{item.name}</option>
              {/each}
            </select>
          </p>
          <p class="lang-pair-choice">
            To
            <select name="to" id="to" bind:value={langPairTo}>
              {#each langs.all() as item}
                <option value={item[3]}>{item.name}</option>
              {/each}
            </select>
          </p>
          <p class="lang-pair-choice">
            Add a new pair
            <img
              src="images/plus-square.svg"
              alt="add"
              class="external-link"
              on:click={addNewLangPair} />
          </p>
        </div>
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content">
        <div>Update email</div>
        <div>
          {$userStore.info.email}
          <img src="images/edit.svg" alt="add" class="external-link" />
        </div>
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