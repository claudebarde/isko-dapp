<script>
  import moment from "moment";
  import firebase from "firebase";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { push } from "svelte-spa-router";
  import userStore from "../../../stores/user-store.js";
  import web3Store from "../../../stores/web3-store.js";
  import { shortenHash, fromWeiToEther } from "../../../utils/functions";
  import Modal from "../../Modal.svelte";
  import Button from "../../Button.svelte";

  let isUpdateModalOpen = false;
  let currentBalance = "...";

  let newFirstname = $userStore.info.firstname;
  let newLastname = $userStore.info.lastname;
  let newEmail = $userStore.info.email;
  let updateButtonType = "success";
  let updateButtonText = "Save";
  let openPaymentHistoryModal = false;
  let openJobsHistoryModal = false;

  const updateName = () => {
    updateButtonType = "success";
    updateButtonText = "Save";
    isUpdateModalOpen = true;
  };

  const closeUpdate = () => {
    isUpdateModalOpen = false;
  };

  const closeCreateNewJob = () => {
    isCreateJobModalOpen = false;
  };

  const saveUpdate = async () => {
    updateButtonType = "loading";
    updateButtonText = "Saving...";
    const updateUserInfo = firebase.functions().httpsCallable("updateUserInfo");
    // generates unique id token
    const idToken = await firebase.auth().currentUser.getIdToken(true);
    // saves user's info
    const result = await updateUserInfo({
      firstname: newFirstname,
      lastname: newLastname,
      accountDB: $userStore.accountType + "s",
      idToken
    });
    if (result.data === true) {
      // update worked
      userStore.updateAccountInfo({
        ...$userStore.info,
        firstname: newFirstname,
        lastname: newLastname
      });
      updateButtonType = "disabled";
      updateButtonText = "Saved!";
      setTimeout(() => closeUpdate(), 500);
    } else if (result.data === null) {
      // wrong account type provided
      closeModal();
      eventsStore.toggleWarningModal(
        "An error has occurred, please try again later."
      );
    } else if (result.data.error) {
      // error
      console.log(result.data.error);
      closeUpdate();
      eventsStore.toggleWarningModal(
        "An error has occurred, please try again later."
      );
    }
  };

  onMount(async () => {
    // fetch current balance
    const balance = await $web3Store.web3.eth.getBalance(
      $web3Store.currentAddress
    );
    let balanceInEth = $web3Store.web3.utils.fromWei(balance, "ether");
    balanceInEth = balanceInEth.split(".");
    currentBalance =
      balanceInEth.length > 1
        ? balanceInEth[0] + "." + balanceInEth[1].slice(0, 2)
        : balanceInEth[0];
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
    margin-right: 3px;
  }

  .date {
    font-size: 0.75rem;
    color: #a0aec0;
    text-align: right;
  }

  .jobs-history {
    display: flex;
    flex-direction: column;
  }

  .icon {
    vertical-align: middle;
    width: 15px;
  }

  .payment-history-line {
    text-align: left;
    width: 40%;
    margin: 0 auto;
    padding: 5px;
  }

  /*Colors for job status*/
  .status-available {
    color: #f56565;
    cursor: pointer;
  }
  .status-accepted {
    color: #ed8936;
    cursor: pointer;
  }
  .status-delivered {
    color: #48bb78;
    cursor: pointer;
  }
  .status-review {
    color: #9f7aea;
    cursor: pointer;
  }

  .status-approved {
    color: #667eea;
    cursor: pointer;
  }
  .status-paidout {
    color: #4299e1;
    cursor: pointer;
  }
  .status-cancelled {
    color: #a0aec0;
    cursor: pointer;
  }

  .jobs-history-grid {
    display: grid;
    grid-template-columns: 10% 45% 15% 30%;
    grid-template-rows: auto;
  }
</style>

{#if openPaymentHistoryModal}
  <Modal type="info" size="small" on:close={() => (openHistoryModal = false)}>
    <div slot="title">Payments History</div>
    <div slot="body">
      {#each $userStore.info.jobs.slice(0, 6) as job}
        <p class="payment-history-line">
          Ξ{fromWeiToEther($web3Store.web3, job.price)}
          <span class="date">{moment(job.timestamp).format('MM/DD/YYYY')}</span>
        </p>
      {/each}
    </div>
  </Modal>
{/if}
{#if openJobsHistoryModal}
  <Modal
    type="info"
    size="small"
    on:close={() => (openJobsHistoryModal = false)}>
    <div slot="title">Jobs History</div>
    <div slot="body">
      {#each $userStore.info.jobs as job}
        <div class="jobs-history-grid">
          {#if job.id.slice(0, 2) === 'fi'}
            <div>
              <img src="images/file.svg" alt="file type" class="icon" />
            </div>
          {:else}
            <div>
              <img src="images/file-text.svg" alt="text type" class="icon" />
            </div>
          {/if}
          <div>
            [
            <strong
              class={job.status ? `status-${job.status.toLowerCase()}` : ''}
              title={`Status: ${job.status}`}
              on:click={() => push(`/view/${job.id}`)}>
              {shortenHash(job.id)}
            </strong>
            ]
          </div>
          <div>Ξ{fromWeiToEther($web3Store.web3, job.price)}</div>
          <div class="date">
            <span>{moment(job.timestamp).format('MM/DD/YYYY')}</span>
          </div>
        </div>
      {/each}
    </div>
  </Modal>
{/if}
{#if $userStore.info}
  <div class="account-container" in:fly={{ y: -100, duration: 500 }}>
    <div class="account-card">
      <div class="account-card__content">
        <div>Name</div>
        <div>
          {`${$userStore.info.firstname} ${$userStore.info.lastname}`}
          <img
            src="images/edit.svg"
            alt="add"
            class="icon"
            on:click={updateName} />
        </div>
      </div>
      <div class="account-card__content">
        <div>Account Address</div>
        <div>{shortenHash($userStore.info.uid)}</div>
      </div>
      <div class="account-card__content">
        <div>Total amount paid</div>
        <div>
          {$web3Store.web3.utils.fromWei($userStore.info.totalPaid.toString(), 'ether')}
          ethers
        </div>
      </div>
      <div class="account-card__content">
        <div>Payment History</div>
        <div>
          {#if $userStore.info}
            {#if $userStore.info.jobs.length <= 5}
              {#each $userStore.info.jobs.slice(0, 6) as job}
                <div>
                  Ξ{fromWeiToEther($web3Store.web3, job.price)}
                  <span class="date">
                    {moment(job.timestamp).format('MM/DD/YYYY')}
                  </span>
                </div>
              {/each}
            {:else}
              <div
                on:click={() => (openPaymentHistoryModal = true)}
                style="cursor:pointer">
                Show history
                <img src="images/list.svg" alt="history" class="icon" />
              </div>
            {/if}
          {:else}Loading...{/if}
        </div>
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
        <div>Last Job</div>
        <div>{shortenHash($userStore.info.lastJob)}</div>
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content">
        <div>Create new job</div>
        <div>
          <Button type="success" text="Start" on:click={() => push('/order')} />
        </div>
      </div>
    </div>
    <div class="account-card">
      <div class="account-card__content">
        <div>Jobs History</div>
        <div class="jobs-history">
          {#if $userStore.info.jobs.length <= 5}
            {#each $userStore.info.jobs as job}
              <div>
                {#if job.id.slice(0, 2) === 'fi'}
                  <img src="images/file.svg" alt="file type" class="icon" />
                {:else}
                  <img
                    src="images/file-text.svg"
                    alt="text type"
                    class="icon" />
                {/if}
                [
                <strong
                  class={job.status ? `status-${job.status.toLowerCase()}` : ''}
                  title={`Status: ${job.status}`}
                  on:click={() => push(`/view/${job.id}`)}>
                  {shortenHash(job.id)}
                </strong>
                ] Ξ{fromWeiToEther($web3Store.web3, job.price)}
                <span class="date">
                  {moment(job.timestamp).format('MM/DD/YYYY')}
                </span>
              </div>
            {:else}No job history{/each}
          {:else}
            <div
              on:click={() => (openJobsHistoryModal = true)}
              style="cursor:pointer">
              Show history
              <img src="images/list.svg" alt="history" class="icon" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  {#if isUpdateModalOpen}
    <Modal type="success" size="small" on:close={closeUpdate}>
      <div slot="title">Update Information</div>
      <div slot="body">
        <h3>Update your name</h3>
        <div class="input-with-button">
          <div>
            <input type="text" bind:value={newFirstname} />
            <input type="text" bind:value={newLastname} />
          </div>
          <Button
            type={updateButtonType}
            text={updateButtonText}
            on:click={saveUpdate} />
        </div>
      </div>
    </Modal>
  {/if}
{:else}Loading info...{/if}
