<script>
  import web3Store from "../stores/web3-store";
  import { createEventDispatcher, onMount } from "svelte";
  import firebase from "../utils/firebaseConfig";

  const dispatch = createEventDispatcher();

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
      console.log(user);
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
    padding: 0px 8px;
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
    <div class="menu-item-address">
      <span>
        {$web3Store.currentAddress === undefined ? '🚫' : $web3Store.currentAddress.slice(0, 4) + '...' + $web3Store.currentAddress.slice(-4)}
      </span>
    </div>
  </div>
  <div class="burger">
    <img src="images/menu.svg" alt="menu" class="cursor-pointer" />
  </div>
</nav>
