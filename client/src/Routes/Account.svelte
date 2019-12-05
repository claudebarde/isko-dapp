<script>
  import Translator from "../Components/Accounts/Translator.svelte";
  import Customer from "../Components/Accounts/Customer.svelte";
  import ConnectedServices from "../Components/ConnectedServices.svelte";
  import Navbar from "../Navbar/Navbar.svelte";
  import userStore from "../stores/user-store";
</script>

<style>
  h1 {
    text-align: center;
  }

  :global(.account-container) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    width: 90%;
    margin: 0 auto;
  }

  :global(.account-card) {
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

  :global(.account-card__content) {
    margin: 0;
    padding: 1rem;
    border-bottom: solid 1px #cbd5e0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  :global(.account-card :last-child) {
    border-bottom: none;
  }

  @media (max-width: 1024px) {
    :global(.account-container) {
      width: 95%;
    }

    :global(.account-card) {
      width: 100%;
    }
  }
</style>

<Navbar />
<main>
  <h1>Account page</h1>
  {#if $userStore.accountType === undefined}
    Loading account type...
  {:else if $userStore.info === undefined}
    Loading user info...
  {:else if $userStore.accountType === 'translator'}
    <Translator />
  {:else}
    <Customer />
  {/if}
</main>
<ConnectedServices />
