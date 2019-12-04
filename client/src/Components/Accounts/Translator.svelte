<script>
  import moment from "moment";
  import langs from "langs";
  import Navbar from "../../Navbar/Navbar.svelte";
  import web3Store from "../../stores/web3-store";
  import userStore from "../../stores/user-store";

  let langPairFrom = undefined;
  let langPairTo = undefined;

  const shortenHash = hash => hash.slice(0, 7) + "..." + hash.slice(-4);

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
  .container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    width: 90%;
    margin: 0 auto;
  }

  .text-card {
    display: flex;
    flex-direction: column;
    justify-content: left;
    align-items: left;
    width: 40%;
    margin: 1.5rem;
    padding: 1.5rem;
    text-align: left;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .text-card__content {
    margin: 0;
    padding: 1rem;
    border-bottom: solid 1px #cbd5e0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .text-card :last-child {
    border-bottom: none;
  }

  .external-link {
    width: 1rem;
    height: 1rem;
    margin-left: 0.5rem;
    cursor: pointer;
  }

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

  select {
    display: block;
    line-height: 1.3;
    padding: 0.6em 1.4em 0.5em 0.8em;
    box-sizing: border-box;
    margin: 0;
    border: 1px solid #cbd5e0;
    box-shadow: 0 1px 0 1px rgba(0, 0, 0, 0.04);
    border-radius: 0.5em;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background-color: #fff;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"),
      linear-gradient(to bottom, #ffffff 0%, #e5e5e5 100%);
    background-repeat: no-repeat, repeat;
    background-position: right 0.7em top 50%, 0 0;
    background-size: 0.5em auto, 100%;
  }
  select::-ms-expand {
    display: none;
  }
  select:hover {
    border-color: #888;
  }
  select:focus {
    border-color: #cbd5e0;
    box-shadow: 0 0 1px 3px rgba(59, 153, 252, 0.7);
    box-shadow: 0 0 0 3px -moz-mac-focusring;
    color: #222;
    outline: none;
  }
  select option {
    font-weight: normal;
  }

  @media (max-width: 1024px) {
    .container {
      width: 95%;
    }

    .text-card {
      width: 100%;
    }
  }
</style>

{#if $userStore.info}
  <div class="container">
    <div class="text-card">
      <div class="text-card__content">
        <div>Name</div>
        <div>{`${$userStore.info.firstname} ${$userStore.info.lastname}`}</div>
      </div>
      <div class="text-card__content">
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
      <div class="text-card__content">
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
      <div class="text-card__content">
        <div>Withdrawal History</div>
        {#if $userStore.info.withdrawals.length === 0}
          No withdrawal
        {:else}Open History{/if}
      </div>
    </div>
    <div class="text-card">
      <div class="text-card__content">
        <div>Account Creation</div>
        <div>
          {moment($userStore.info.creation).format('MMM Do YYYY, h:mm:ss a')}
        </div>
      </div>
      <div class="text-card__content">
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
      <div class="text-card__content">
        <div>Number of translations</div>
        <div>{$userStore.info.numberOfTranslations}</div>
      </div>
      <div class="text-card__content">
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
    <div class="text-card">
      <div class="text-card__content">
        <div>Language Pairs</div>
        <div>{$userStore.info.languagePairs.length}</div>
      </div>
      {#if $userStore.info.languagePairs.length > 0}
        <div class="text-card__content">
          {#each $userStore.info.languagePairs as item}
            <span>
              {`${langs.where('3', item.from).name} => ${langs.where('3', item.to).name}`}
            </span>
          {/each}
        </div>
      {/if}
      <div class="text-card__content">
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
    <div class="text-card">Update Info</div>
  </div>
{:else}
  <div>Loading info</div>
{/if}
