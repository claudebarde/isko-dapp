<script>
  import moment from "moment";
  import { onMount } from "svelte";
  import userStore from "../../stores/user-store.js";

  onMount(() => {
    console.log($userStore.info);
  });
</script>

{#if $userStore.info}
  <div class="account-container">
    <div class="account-card">
      <div class="account-card__content">
        <div>Name</div>
        <div>{`${$userStore.info.firstname} ${$userStore.info.lastname}`}</div>
      </div>
      <div class="account-card__content">
        <div>User ID</div>
        <div>{$userStore.info.uid}</div>
      </div>
      <div class="account-card__content">
        <div>Last Payments</div>
        <div>Payments</div>
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
        <div>Creation Transaction</div>
        <div>no tx hash</div>
      </div>
      <div class="account-card__content">
        <div>Number of translations</div>
        <div>{$userStore.info.numberOfTranslations}</div>
      </div>
      <div class="account-card__content">
        <div>Feedbacks</div>
        <div>Feedbacks</div>
      </div>
    </div>
    <div class="account-card">Other info</div>
    <div class="account-card">Update Info</div>
  </div>
{:else}Loading info...{/if}
