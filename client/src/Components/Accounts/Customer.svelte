<script>
  import moment from "moment";
  import firebase from "firebase";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import userStore from "../../stores/user-store.js";
  import web3Store from "../../stores/web3-store.js";
  import { shortenHash } from "../../utils/functions";
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";

  let isUpdateModalOpen = false;
  let willUpdateName = false;
  let currentBalance = "...";

  let newFirstname = $userStore.info.firstname;
  let newLastname = $userStore.info.lastname;
  let newEmail = $userStore.info.email;

  const updateName = () => {
    isUpdateModalOpen = true;
    willUpdateName = true;
  };

  const closeModal = () => {
    isUpdateModalOpen = false;
    willUpdateName = false;
  };

  const saveUpdate = async () => {
    const updateUserInfo = firebase.functions().httpsCallable("updateUserInfo");
    // generates unique id token
    const idToken = await firebase.auth().currentUser.getIdToken(true);
    // saves user's info
    const result = await updateUserInfo({
      firstname: newFirstname,
      lastname: newLastname,
      accountDB: $userStore.accountType,
      idToken
    });
  };

  onMount(async () => {
    // fetch current balance
    const balance = await $web3Store.web3.eth.getBalance(
      $web3Store.currentAddress
    );
    const balanceInEth = $web3Store.web3.utils.fromWei(balance, "ether");
    currentBalance = Math.round(balanceInEth * 100) / 100;
  });
</script>

<style>
  input {
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: solid 1px #cbd5e0;
    font-size: 1rem;
  }

  .input-with-button {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .input-with-button input {
    width: 28%;
  }
</style>

{#if $userStore.info}
  <div class="account-container" in:fly={{ y: -100, duration: 500 }}>
    <div class="account-card">
      <div class="account-card__content">
        <div>Name</div>
        <div>{`${$userStore.info.firstname} ${$userStore.info.lastname}`}</div>
      </div>
      <div class="account-card__content">
        <div>Account Address</div>
        <div>{shortenHash($userStore.info.uid)}</div>
      </div>
      <div class="account-card__content">
        <div>Last Job</div>
        <div>{$userStore.info.lastJob}</div>
      </div>
      <div class="account-card__content">
        <div>Payment History</div>
        <div>Payments</div>
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content">
        <div>Account Creation</div>
        <div>
          {moment($userStore.info.creation).format('MMM Do YYYY, h:mm:ss a')}
        </div>
      </div>
      <div class="account-card__content">
        <div>Current Balance</div>
        <div>{currentBalance} ethers</div>
      </div>
      <div class="account-card__content">
        <div>Number of created jobs</div>
        <div>{$userStore.info.jobs.length}</div>
      </div>
      <div class="account-card__content">
        <div>Total amount paid</div>
        <div>{$userStore.info.totalPaid}</div>
      </div>
    </div>
    <div class="account-card">Other info</div>
    <div class="account-card">
      <div class="account-card__content">
        <div>Update name</div>
        <div>
          {`${$userStore.info.firstname} ${$userStore.info.lastname}`}
          <img
            src="images/edit.svg"
            alt="add"
            class="external-link"
            on:click={updateName} />
        </div>
      </div>
    </div>
  </div>
  {#if isUpdateModalOpen}
    <Modal type="info-update" size="small" on:close={closeModal}>
      <div slot="title">Update Information</div>
      <div slot="body">
        {#if willUpdateName}
          <h3>Update your name</h3>
          <div class="input-with-button">
            <input type="text" bind:value={newFirstname} />
            <input type="text" bind:value={newLastname} />
            <Button type="success" text="Update" on:click={saveUpdate} />
          </div>
        {/if}
      </div>
    </Modal>
  {/if}
{:else}Loading info...{/if}
