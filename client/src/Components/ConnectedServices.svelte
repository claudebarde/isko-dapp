<script>
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
</script>

<style>
  .container {
    position: fixed;
    bottom: 0px;
    left: 0px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px;
  }

  .container div {
    padding: 10px;
    border-top: solid 1px #e2e8f0;
    border-right: solid 1px #e2e8f0;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .container div img {
    width: 20px;
    height: 20px;
  }

  .info {
    background-color: #bee3f8;
  }

  .success {
    background-color: #c6f6d5;
  }

  .warning {
    background-color: #feebc8;
  }
</style>

<div class="container">
  <div
    class={$web3Store.isMetamaskConnected ? 'success' : 'warning'}
    title={$web3Store.isMetamaskConnected ? 'Connected to MetaMask' : 'No Connection to MetaMask'}>
    <img src="images/metamask-fox.svg" alt="metamask" />
  </div>
  {#if $userStore.isUserConnected}
    <div
      class={!!parseInt($userStore.balance) ? 'success' : 'info'}
      title={!!parseInt($userStore.balance) ? 'Connected to Smart Contract' : 'Customer Account'}>
      <img src="images/ethereum-contract.svg" alt="contract" />
    </div>
  {:else}
    <div
      class={!!parseInt($userStore.balance) ? 'success' : 'warning'}
      title={!!parseInt($userStore.balance) ? 'Connected to Smart Contract' : 'No Record in Smart Contract'}>
      <img src="images/ethereum-contract.svg" alt="contract" />
    </div>
  {/if}
  <div
    class={$userStore.isUserConnected ? 'success' : 'warning'}
    title={$userStore.isUserConnected ? 'Connected to Account' : 'No Connection to Account'}>
    <img src="images/web-page.svg" alt="profile" />
  </div>
</div>
