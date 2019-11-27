<script>
  import Web3 from "web3";
  import Navbar from "./Navbar/Navbar.svelte";
  import Alert from "./Components/Alert.svelte";
  import LoginModal from "./Components/Modals/LoginModal.svelte";
  import SignupModal from "./Components/Modals/SignupModal.svelte";
  import WarningModal from "./Components/Modals/WarningModal.svelte";
  import Toast from "./Components/Toast.svelte";
  import { onMount } from "svelte";
  import web3Store from "./stores/web3-store";

  let isLoginModalOpen = false;
  let isSignupModalOpen = false;
  let isWarningModalOpen = false;
  let warningType = undefined;
  let toastOpen = false;
  const toggleToast = state => {
    if (state === false) toastOpen = false;

    toastOpen = true;
    setTimeout(() => (toastOpen = false), 3000);
  };
  const toastTypes = {
    metamaskLoading: {
      title: "Loading...",
      text: "Checking your connection to MetaMask",
      type: "info",
      icon: "clock"
    },
    metamaskConnected: {
      title: "Connected to MetaMask",
      text: `You are now connected to MetaMask`,
      type: "success",
      icon: "thumbs-up"
    },
    metamaskDisconnected: {
      title: "Disconnected from MetaMask",
      text: `You have been disconnected from MetaMask, \nplease reconnect`,
      type: "warning",
      icon: "alert-triangle"
    }
  };
  let toastType = "metamaskLoading";

  onMount(async () => {
    toggleToast(true);
    let web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:7545")
    );
    console.log(await web3.eth.getAccounts());
    // detects MetaMask
    if (window.ethereum) {
      // MetaMask injected web3
      let metaMaskWeb3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // finds user account
        metaMaskWeb3.eth.getAccounts((err, accounts) => {
          if (err) throw err;

          web3Store.hasMetamask(true);
          if (accounts.length === 0) {
            web3Store.isMetamaskConnected(false);
          } else {
            // if connected
            web3Store.isMetamaskConnected(true);
            web3Store.setCurrentAddress(accounts[0]);
            toastType = "metamaskConnected";
            toggleToast(false);
            // listens to change events with MetaMask
            metaMaskWeb3.currentProvider.publicConfigStore.on("update", obj => {
              //console.log(obj);
              if (obj.selectedAddress === null) {
                // user logged out
                web3Store.isMetamaskConnected(false);
                web3Store.setCurrentAddress(undefined);
                // we close eventually open modals
                isLoginModalOpen = false;
                isSignupModalOpen = false;
                // we display the toast
                toastType = "metamaskDisconnected";
                toggleToast(true);
              } else if (
                obj.selectedAddress &&
                !$web3Store.isMetamaskConnected
              ) {
                // user logged in
                web3Store.isMetamaskConnected(true);
                web3Store.setCurrentAddress(obj.selectedAddress);
                // in case warning modal was open
                isWarningModalOpen = false;
                // we display the toast
                toastType = "metamaskConnected";
                toggleToast(true);
              }
            });
          }
        });
      } catch (error) {}
    } else {
      web3Store.hasMetamask(false);
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  });
</script>

<style>
  main {
    padding: 7rem 0.5rem 0.75rem 0.5rem;
    height: 100%;
  }

  .presentation,
  .presentation-reverse {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .text-card {
    width: 100%;
    margin: 3rem 1.5rem;
    padding: 2.5rem 0.5rem;
    text-align: center;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .text-card__image {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 1rem;
  }

  @media (min-width: 640px) {
  }

  @media (min-width: 1024px) {
    .text-card {
      width: 44%;
      margin: 0;
    }

    .text-card__image {
      width: 50%;
    }

    .presentation {
      padding: 3rem;
    }

    .presentation-reverse {
      flex-direction: row-reverse;
      padding: 3rem;
    }

    .presentation-reverse .text-card__image {
      justify-content: center;
    }
  }
</style>

<!--<div>Icons made by <a href="https://www.flaticon.com/authors/prettycons" title="prettycons">prettycons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>-->
{#if isLoginModalOpen}
  <LoginModal on:close={event => (isLoginModalOpen = false)} />
{/if}
{#if isSignupModalOpen}
  <SignupModal on:close={event => (isSignupModalOpen = false)} />
{/if}
{#if isWarningModalOpen}
  <WarningModal
    type={warningType}
    size="small"
    on:close={event => (isWarningModalOpen = false)} />
{/if}
<Navbar
  on:openLogin={event => (isLoginModalOpen = true)}
  on:openSignup={event => (isSignupModalOpen = true)}
  on:openWarning={event => {
    isWarningModalOpen = true;
    warningType = event.detail;
  }} />
<main>
  {#if $web3Store.hasMetamas === false}
    <Alert
      type="warning"
      text="Please install Metamask to continue"
      hasDot={true} />
  {/if}
  <div class="presentation">
    <div class="text-card">
      <h1>Isko Eth</h1>
      <br />
      <h3>The first blockchain connected translation app!</h3>
    </div>
    <div class="text-card__image">
      <img
        src="images/undraw_Organizing_projects_0p9a.svg"
        alt="translator"
        style="height: 16rem" />
    </div>
  </div>
  <div class="presentation-reverse">
    <div class="text-card">
      <h1>Get your translation done!</h1>
      <br />
      <h3>Post a translation job</h3>
    </div>
    <div class="text-card__image">
      <img
        src="images/undraw_transfer_files_6tns.svg"
        alt="client"
        style="height: 14rem" />
    </div>
  </div>
  <div class="presentation">
    <div class="text-card">
      <h1>Become a translator!</h1>
      <br />
      <h3>Sign up now</h3>
    </div>
    <div class="text-card__image">
      <img
        src="images/undraw_fill_forms_yltj.svg"
        alt="sign up"
        style="height: 14rem" />
    </div>
  </div>
</main>
{#if toastOpen}
  <Toast
    title={toastTypes[toastType].title}
    text={toastTypes[toastType].text}
    type={toastTypes[toastType].type}
    icon={toastTypes[toastType].icon} />
{/if}
