<script>
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import { createEventDispatcher, onMount } from "svelte";
  import firebase from "../utils/firebaseConfig";
  import Tooltip from "../Components/Tooltip.svelte";

  const dispatch = createEventDispatcher();
  let isUserConnected = false;
  let isUserTooltipOpen = false;

  const openLoginModal = () => {
    dispatch("openLogin", true);
  };

  const openSignupModal = () => {
    dispatch("openSignup", true);
  };

  const openWarningModal = () => {
    dispatch("openWarning", "no-metamask");
  };

  onMount(() => {
    // FIREBASE AUTH
    firebase.auth().onAuthStateChanged(function(user) {
      if (user !== null) {
        isUserConnected = true;
      } else {
        isUserConnected = false;
      }
    });
  });
</script>

<style>
  .navbar {
    display: flex;
    align-content: center;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 2rem 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 100%;
    z_index: 40;
    position: fixed;
    background-color: #4fd1c5;
  }

  .navbar-menu {
    display: none;
    margin-right: 2rem;
  }

  .navbar-logo {
    font-weight: bold;
    color: white;
    font-size: 1.125rem;
    margin-left: 2rem;
  }

  .burger {
    display: none;
    margin-right: 2rem;
  }

  .menu-item {
    padding: 0px 8px;
    color: #edf2f7;
  }

  .menu-item:hover {
    color: white;
  }

  .menu-item span {
    cursor: pointer;
  }

  .menu-item-address {
    position: relative;
    display: inline-block;
    padding: 0px 8px;
  }

  .menu-item-address__text {
    color: #edf2f7;
    font-style: italic;
    text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .navbar-menu {
      display: none;
    }
    .burger {
      display: block;
    }
  }

  @media (min-width: 640px) {
    .navbar-menu {
      display: flex;
      flex-direction: row;
      align-content: center;
      align-items: center;
    }
    .burger {
      display: none;
    }
  }
</style>

<nav class="navbar">
  <div class="navbar-logo">Isko Eth</div>
  <div class="navbar-menu">
    <div class="menu-item">
      <span>Translate</span>
    </div>
    <div class="menu-item">
      <span>Market</span>
    </div>
    {#if isUserConnected}
      <div class="menu-item" on:click={() => console.log('log out')}>
        <span>Log Out</span>
      </div>
    {:else}
      <div
        class="menu-item"
        on:click={$web3Store.isMetamaskConnected ? openSignupModal : openWarningModal}>
        <span>Sign Up</span>
      </div>
      <div
        class="menu-item"
        on:click={$web3Store.isMetamaskConnected ? openLoginModal : openWarningModal}>
        <span>Log In</span>
      </div>
    {/if}
    <div class="menu-item-address">
      <span
        class="menu-item-address__text"
        on:mouseenter={() => (isUserTooltipOpen = true)}
        on:mouseleave={() => (isUserTooltipOpen = false)}>
        {$web3Store.currentAddress === undefined ? '🚫' : $web3Store.currentAddress.slice(0, 4) + '...' + $web3Store.currentAddress.slice(-4)}
      </span>
      {#if isUserTooltipOpen}
        <Tooltip
          content={['Current balance:', `${$web3Store.web3.utils.fromWei($userStore.balance, 'ether')} ether`]} />
      {/if}
    </div>
  </div>
  <div class="burger">
    <img src="images/menu.svg" alt="menu" class="cursor-pointer" />
  </div>
</nav>
