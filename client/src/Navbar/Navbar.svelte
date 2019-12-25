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
  import WarningModal from "../Components/Modals/WarningModal.svelte";
  import LoginModal from "../Components/Modals/LoginModal.svelte";
  import SignupModal from "../Components/Modals/SignupModal.svelte";
  import Modal from "../Components/Modal.svelte";
  import Button from "../Components/Button.svelte";
  import { link, push, location } from "svelte-spa-router";
  import contractInterface from "../../../build/contracts/IskoEth.json";
  import { shortenHash } from "../utils/functions";
  import "firebase/firestore";

  const dispatch = createEventDispatcher();
  let isUserTooltipOpen = false;
  const { toastTypes } = $eventsStore;
  const { toggleToast, setToastType } = eventsStore;
  let subscribeToAccount;
  let connectWalletModal = false;
  let loading = true;

  const openLoginModal = () => {
    dispatch("openLogin", true);
  };

  const openSignupModal = () => {
    dispatch("openSignup", true);
  };

  const openWarningModal = msg => {
    eventsStore.toggleWarningModal(msg);
  };

  // listens to account change events with MetaMask
  ethereum.on("accountsChanged", async accounts => {
    // sign out user from firebase
    await firebase.auth().signOut();
    // we reset info in user store
    userStore.reset();
    userStore.connectedUser(false);
    userStore.updateBalance(0);
    web3Store.setCurrentAddress(undefined);
    if (accounts.length === 0) {
      web3Store.isMetamaskConnected(false);
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
      if (userBalance > 0) userStore.updateAccountType("translator");
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

  // FIREBASE AUTH
  firebase.auth().onAuthStateChanged(async user => {
    //console.log("change of auth state:", user);
    if (user !== null) {
      if (!$web3Store.currentAddress) {
        // tries to renew user's address
        const accounts = await ethereum.enable();
        if (accounts.length > 0) web3Store.setCurrentAddress(accounts[0]);
      }
      //console.log(await firebase.auth().currentUser.getIdToken(true));
      // checks if current address matches uid
      console.log($web3Store.currentAddress, user.uid.toLowerCase());
      if (
        $web3Store.currentAddress &&
        user.uid.toLowerCase() === $web3Store.currentAddress.toLowerCase()
      ) {
        userStore.connectedUser(true);
        if ($userStore.balance > 0) {
          // user is registered as a translator
          userStore.updateAccountType("translator");
          // we fetch user's info
          if (!$userStore.info) {
            console.log("call to firebase/translators");
            // prepares function to fetch user's information
            const db = firebase.firestore();
            subscribeToAccount = await db
              .collection("translators")
              .doc(user.uid)
              .onSnapshot(doc => {
                if (doc.exists) {
                  userStore.updateAccountInfo({
                    ...doc.data(),
                    uid: user.uid,
                    email: user.email,
                    languagePairs: doc.data().languagePairs.map(pair => {
                      const obj = pair.split("|");
                      return { from: obj[0], to: obj[1] };
                    })
                  });
                }
              });
            /*const doc = await db
              .collection("translators")
              .doc(user.uid)
              .get();
            if (doc.exists) {
              userStore.updateAccountInfo({
                ...doc.data(),
                uid: user.uid,
                email: user.email,
                languagePairs: doc.data().languagePairs.map(pair => {
                  const obj = pair.split("|");
                  return { from: obj[0], to: obj[1] };
                })
              });
            }*/
          }
        } else {
          // user is registered as a customer
          userStore.updateAccountType("customer");
          // we fetch user's info
          if (!$userStore.info) {
            console.log("call to firebase/customers");
            // prepares function to fetch user's information
            const db = firebase.firestore();
            const doc = await db
              .collection("customers")
              .doc(user.uid)
              .get();
            if (doc.exists) {
              userStore.updateAccountInfo({
                ...doc.data(),
                uid: user.uid,
                email: user.email
              });
            }
          }
        }
      } else {
        openWarningModal(
          `Your current address (${shortenHash(
            $web3Store.currentAddress
          )}) doesn't match your registered address. Please switch to the address you used when registering your account.`
        );
        // sign out user from firebase
        await firebase.auth().signOut();
      }
    } else {
      console.log("user not connected");
      userStore.connectedUser(false);
      // goes back to main page
      if (location !== "/") push("/");
    }
  });

  const connectWallet = async wallet => {
    if (wallet === "metamask") {
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
          connectWalletModal = false;
          // saves info in session storage
          if (window.sessionStorage)
            sessionStorage.setItem("metamask-permission", true);
        }
      } catch (error) {
        console.log(error);
        web3Store.isMetamaskConnected(false);
      }
    }
  };

  onMount(async () => {
    // if MetaMask is already connected (for example after route change)
    if ($web3Store.isMetamaskConnected) return;

    //toggleToast(true);

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
          if (
            window.sessionStorage &&
            window.sessionStorage.getItem("metamask-permission")
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
              if (userBalance > 0) userStore.updateAccountType("translator");
            } catch (error) {
              console.log(error);
              eventsStore.toggleWarningModal(
                "There was a problem connecting to the smart contract.<br><br>Please try again later or contact the customer service."
              );
            }
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
    loading = false;
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

  .navbar a,
  .navbar span {
    padding: 0px 8px;
    color: #edf2f7;
    text-decoration: none;
    cursor: pointer;
  }

  .navbar a:hover,
  .navbar span:hover {
    color: white;
  }

  .menu-item {
    padding: 0px 8px;
    color: #edf2f7;
    text-decoration: none;
    cursor: pointer;
  }

  .menu-item:hover {
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

  .connect-wallet {
    color: #4fd1c5;
    border: solid 1px #edf2f7;
    padding: 5px;
    border-radius: 5px;
    background-color: #edf2f7;
    cursor: pointer;
  }

  .connect-wallet:hover {
    background-color: white;
  }

  .connect-wallet-modal {
    background-color: white;
  }

  .connect-wallet-modal__option {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    text-align: left;
    margin: 10px;
    padding: 10px;
    background-color: #f7f8f9;
    border: solid 1px #f7f8f9;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    cursor: pointer;
  }

  .connect-wallet-modal__option img {
    height: 50px;
    width: 50px;
    margin-right: 20px;
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

{#if $eventsStore.isWarningModalOpen}
  <WarningModal type="warning" size="small" />
{/if}
{#if $eventsStore.isLoginModalOpen}
  <LoginModal on:close={eventsStore.toggleLoginModal} />
{/if}
{#if $eventsStore.isSignupModalOpen && parseInt($userStore.balance) === 0 && $userStore.balance !== undefined}
  <SignupModal on:close={eventsStore.toggleSignupModal} />
{/if}
{#if connectWalletModal}
  <Modal size="small" type="info" on:close={() => (connectWalletModal = false)}>
    <div slot="title">Connect a Wallet</div>
    <div slot="body" class="connect-wallet-modal">
      <div
        class="connect-wallet-modal__option"
        on:click={() => connectWallet('metamask')}>
        <img src="images/metamask-fox.svg" alt="metamask" />
        Connect MetaMask Wallet
      </div>
    </div>
  </Modal>
{/if}
<nav class="navbar">
  <div class="navbar-logo">
    <a href="/" use:link>Isko Eth</a>
  </div>
  <div class="navbar-menu">
    <div>
      <a href="/translate" use:link>Translate</a>
    </div>
    <div>
      <a href="/market" use:link>Market</a>
    </div>
    {#if loading}
      <div class="menu-item">Loading the awesome...</div>
    {:else if !$web3Store.hasMetamask}
      <div>
        <div
          class="connect-wallet"
          on:click={() => (connectWalletModal = true)}>
          Connect Wallet
        </div>
      </div>
    {:else}
      {#if $userStore.isUserConnected !== undefined}
        {#if $userStore.isUserConnected}
          <div>
            <a href="/account" use:link>Account</a>
          </div>
          <div
            on:click={async () => {
              try {
                await firebase.auth().signOut();
                userStore.connectedUser(false);
                if ($userStore.accountType === 'customer') {
                  userStore.updateAccountType(undefined);
                }
              } catch (error) {
                error;
              }
            }}>
            <a href="/" use:link>Log Out</a>
          </div>
        {:else}
          {#if parseInt($userStore.balance) === 0}
            <div
              on:click={$web3Store.isMetamaskConnected ? eventsStore.toggleSignupModal : () => openWarningModal('You must be connected to MetaMask to perform this action.')}>
              <span>Sign Up</span>
            </div>
          {/if}
          <div
            on:click={$web3Store.isMetamaskConnected ? eventsStore.toggleLoginModal : () => openWarningModal('You must be connected to MetaMask to perform this action.')}>
            <span>Log In</span>
          </div>
        {/if}
      {/if}
      <div class="menu-item-address">
        {#if $userStore.accountType === 'translator'}
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
        {#if isUserTooltipOpen && userStore.accountType === 'translator'}
          <Tooltip
            content={['Current balance:', `${$web3Store.web3.utils.fromWei($userStore.balance, 'ether')} ether`]}
            align="right" />
        {/if}
      </div>
    {/if}
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
