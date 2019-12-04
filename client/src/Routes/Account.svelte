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
