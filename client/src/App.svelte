<script>
  import Web3 from "web3";
  import firebase from "firebase";
  import Navbar from "./Navbar/Navbar.svelte";
  import Alert from "./Components/Alert.svelte";
  import Button from "./Components/Button.svelte";
  import ConnectedServices from "./Components/ConnectedServices.svelte";
  import LoginModal from "./Components/Modals/LoginModal.svelte";
  import SignupModal from "./Components/Modals/SignupModal.svelte";
  import WarningModal from "./Components/Modals/WarningModal.svelte";
  import Toast from "./Components/Toast.svelte";
  import { onMount } from "svelte";
  import web3Store from "./stores/web3-store";
  import userStore from "./stores/user-store";
  import eventsStore from "./stores/events-store";
  import contractInterface from "../../build/contracts/IskoEth.json";

  let isLoginModalOpen = false;
  let isSignupModalOpen = false;
  let warningType = undefined;
  const { toastTypes } = $eventsStore;

  onMount(async () => {
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
              web3Store.setCurrentAddress(accounts[0]);
              setToastType("metamaskConnected");
              toggleToast(true);
              // listens to account change events with MetaMask
              ethereum.on("accountsChanged", async accounts => {
                // sign out user from firebase
                await firebase.auth().signOut();
                if (accounts.length === 0) {
                  web3Store.isMetamaskConnected(false);
                  web3Store.setCurrentAddress(undefined);
                  setToastType("metamaskDisconnected");
                  toggleToast(true);
                } else {
                  // if connected
                  web3Store.isMetamaskConnected(true);
                  web3Store.setCurrentAddress(accounts[0]);
                  // updates user's balance (will close signup modal)
                  const userBalance = await $web3Store.contractInstance.methods
                    .returnTranslator($web3Store.currentAddress)
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
                  web3Store.setCurrentAddress(accounts[0]);
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
              .returnTranslator($web3Store.currentAddress)
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
{#if isSignupModalOpen && parseInt($userStore.balance) === 0 && $userStore.balance !== undefined}
  <SignupModal on:close={event => (isSignupModalOpen = false)} />
{/if}
{#if $eventsStore.isWarningModalOpen}
  <WarningModal type={warningType} size="small" />
{/if}
<Navbar
  on:openLogin={event => (isLoginModalOpen = true)}
  on:openSignup={event => (isSignupModalOpen = true)} />
<main>
  {#if $web3Store.hasMetamask === false}
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
      <Button text={'Post a translation job'} type="teal" />
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
      <Button text={'Sign up now!'} type="teal" />
    </div>
    <div class="text-card__image">
      <img
        src="images/undraw_fill_forms_yltj.svg"
        alt="sign up"
        style="height: 14rem" />
    </div>
  </div>
</main>
<ConnectedServices />
{#if $eventsStore.toastOpen}
  <Toast
    title={toastTypes[$eventsStore.toastType].title}
    text={toastTypes[$eventsStore.toastType].text}
    type={toastTypes[$eventsStore.toastType].type}
    icon={toastTypes[$eventsStore.toastType].icon} />
{/if}
