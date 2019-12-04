<script>
  import Web3 from "web3";
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import eventsStore from "../stores/events-store";
  import { createEventDispatcher, onMount } from "svelte";
  import firebase from "../utils/firebaseConfig";
  import Tooltip from "../Components/Tooltip.svelte";
  import Dot from "../Components/Dot.svelte";
  import Toast from "../Components/Toast.svelte";
  import { link, push } from "svelte-spa-router";
  import contractInterface from "../../../build/contracts/IskoEth.json";
  import "firebase/firestore";

  const dispatch = createEventDispatcher();
  let isUserTooltipOpen = false;
  const { toastTypes } = $eventsStore;

  const openLoginModal = () => {
    dispatch("openLogin", true);
  };

  const openSignupModal = () => {
    dispatch("openSignup", true);
  };

  const openWarningModal = () => {
    eventsStore.toggleWarningModal(
      "You must be connected to MetaMask to perform this action."
    );
  };

  onMount(async () => {
    // if MetaMask is already connected (for example after route change)
    if ($web3Store.isMetamaskConnected) return;
    const { toggleToast, setToastType } = eventsStore;

    toggleToast(true);

    // detects ethereum provider injected by MetaMask
    if (window.ethereum) {
      // saves web3 instance in the store
      // TODO: REPLACE LOCALHOST WITH INFURA NODE FOR PRODUCTION
      const web3 = new Web3(
        new Web3.providers.WebsocketProvider("ws://localhost:7545")
      );
      web3Store.setWeb3(web3);
      // instantiates contract interface
      const contract = new web3.eth.Contract(
        contractInterface.abi,
        $web3Store.contractAddress
      );
      web3Store.setContractInstance(contract);
      // if MetaMask is installed
      if (ethereum.isMetaMask) {
        if (
          parseInt(ethereum.networkVersion) === 1 ||
          process.env.NODE_ENV === "development"
        ) {
          try {
            const accounts = await ethereum.enable();
            web3Store.hasMetamask(true);
            // finds user's address
            if (accounts.length === 0) {
              web3Store.isMetamaskConnected(false);
            } else {
              // if connected
              web3Store.isMetamaskConnected(true);
              web3Store.setCurrentAddress(accounts[0].toLowerCase());
              setToastType("metamaskConnected");
              toggleToast(true);
              // listens to account change events with MetaMask
              ethereum.on("accountsChanged", async accounts => {
                // sign out user from firebase
                await firebase.auth().signOut();
                // we reset info in user store
                userStore.reset();
                userStore.connectedUser(false);
                userStore.updateBalance(0);
                if (accounts.length === 0) {
                  web3Store.isMetamaskConnected(false);
                  web3Store.setCurrentAddress(undefined);
                  setToastType("metamaskDisconnected");
                  toggleToast(true);
                } else {
                  // if connected
                  web3Store.isMetamaskConnected(true);
                  web3Store.setCurrentAddress(accounts[0].toLowerCase());
                  // updates user's balance (will close signup modal)
                  const userBalance = await $web3Store.contractInstance.methods
                    .returnTranslator(accounts[0].toLowerCase())
                    .call();
                  userStore.updateBalance(userBalance);
                  setToastType("metamaskConnected");
                  toggleToast(true);
                }
              });
              // listens to network change events with MetaMask
              ethereum.on("networkChanged", networkID => {
                if (networkID === 1) {
                  // if connected
                  web3Store.isMetamaskConnected(true);
                  web3Store.setCurrentAddress(accounts[0].toLowerCase());
                  setToastType("metamaskConnected");
                  toggleToast(true);
                } else {
                  web3Store.isMetamaskConnected(false);
                  web3Store.setCurrentAddress(undefined);
                  setToastType("metamaskMainNetwork");
                  toggleToast(true);
                }
              });
            }
          } catch (error) {
            console.log(error);
            web3Store.isMetamaskConnected(false);
          }
          // checks if user is already registered in smart contract
          try {
            // returns translator balance if any
            const userBalance = await contract.methods
              .returnTranslator($web3Store.currentAddress.toLowerCase())
              .call();
            userStore.updateBalance(userBalance);
          } catch (error) {
            console.log(error);
          }
        } else {
          web3Store.isMetamaskConnected(false);
          setToastType("metamaskMainNetwork");
          toggleToast(true);
        }
      } else {
        web3Store.hasMetamask(false);
      }
    } else {
      web3Store.hasMetamask(false);
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
    // checks user balance to know if active
    // FIREBASE AUTH
    firebase.auth().onAuthStateChanged(async user => {
      if (user !== null) {
        console.log(user);
        // check if user is translator or customer
        let accountDB = undefined;
        if ($web3Store.web3 && $web3Store.web3.utils.isAddress(user.uid)) {
          userStore.updateAccountType("translator");
          accountDB = "translators";
          // check if current address matches registered address
          if (
            user.uid.toLowerCase() !== $web3Store.currentAddress.toLowerCase()
          ) {
            // signs out user
            await firebase.auth().signOut();
            userStore.reset();
            userStore.connectedUser(false);
            userStore.updateBalance(undefined);
            // goes back to main page
            push("/");
          } else {
            userStore.connectedUser(true);
            // checks if user is already registered in smart contract
            try {
              // returns translator balance if any
              const userBalance = await $web3Store.contractInstance.methods
                .returnTranslator($web3Store.currentAddress.toLowerCase())
                .call();
              userStore.updateBalance(userBalance);
            } catch (error) {
              console.log(error);
            }
          }
        } else {
          userStore.updateAccountType("customer");
          accountDB = "customers";
          userStore.connectedUser(true);
        }
        // we fetch user's info
        if (!$userStore.info) {
          console.log("call to firebase");
          // prepares function to fetch user's information
          const db = firebase.firestore();
          const doc = await db
            .collection($userStore.accountType + "s")
            .doc(user.uid)
            .get();
          if (doc.exists) {
            userStore.updateAccountInfo({ ...doc.data(), uid: user.uid });
          }
        }
      } else {
        console.log("user not connected");
        userStore.connectedUser(false);
        // goes back to main page
        push("/");
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

  .navbar a {
    padding: 0px 8px;
    color: #edf2f7;
    text-decoration: none;
  }

  .navbar a:hover {
    color: white;
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
  <div class="navbar-logo">
    <a href="/" use:link>Isko Eth</a>
  </div>
  <div class="navbar-menu">
    <div class="menu-item">
      <a href="/translate" use:link>Translate</a>
    </div>
    <div class="menu-item">
      <a href="/market" use:link>Market</a>
    </div>
    {#if $userStore.isUserConnected !== undefined}
      {#if $userStore.isUserConnected}
        <div class="menu-item">
          <a href="/account" use:link>Account</a>
        </div>
        <div
          class="menu-item"
          on:click={async () => {
            try {
              await firebase.auth().signOut();
              userStore.connectedUser(false);
            } catch (error) {
              error;
            }
          }}>
          <a href="/" use:link>Log Out</a>
        </div>
      {:else}
        {#if parseInt($userStore.balance) === 0}
          <div
            class="menu-item"
            on:click={$web3Store.isMetamaskConnected ? openSignupModal : openWarningModal}>
            <a href="#">Sign Up</a>
          </div>
        {/if}
        <div
          class="menu-item"
          on:click={$web3Store.isMetamaskConnected ? openLoginModal : openWarningModal}>
          <a href="#">Log In</a>
        </div>
      {/if}
    {/if}
    <div class="menu-item-address">
      {#if !!parseInt($userStore.balance)}
        <Dot type="success" />
      {:else if $userStore.accountType === 'customer'}
        <Dot type="info" />
      {:else}
        <Dot type="error" />
      {/if}
      <span
        class="menu-item-address__text"
        on:mouseenter={() => (isUserTooltipOpen = true)}
        on:mouseleave={() => (isUserTooltipOpen = false)}>
        {$web3Store.currentAddress === undefined ? '🚫' : $web3Store.currentAddress.slice(0, 6) + '...' + $web3Store.currentAddress.slice(-4)}
      </span>
      {#if isUserTooltipOpen}
        <Tooltip
          content={['Current balance:', `${$web3Store.web3.utils.fromWei($userStore.balance, 'ether')} ether`]}
          align="right" />
      {/if}
    </div>
  </div>
  <div class="burger">
    <img src="images/menu.svg" alt="menu" class="cursor-pointer" />
  </div>
</nav>
{#if $eventsStore.toastOpen}
  <Toast
    title={toastTypes[$eventsStore.toastType].title}
    text={toastTypes[$eventsStore.toastType].text}
    type={toastTypes[$eventsStore.toastType].type}
    icon={toastTypes[$eventsStore.toastType].icon} />
{/if}
