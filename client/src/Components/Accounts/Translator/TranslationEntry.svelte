<script>
  import { onMount, createEventDispatcher } from "svelte";
  import moment from "moment";
  import { shortenHash, fromWeiToEther } from "../../../utils/functions";

  export let translHash;
  export let transl;
  export let web3;
  export let type;

  let interval;
  let dateNow = Date.now();
  let timeSinceDelivered = 0;
  const dispatch = createEventDispatcher();

  onMount(() => {
    timeSinceDelivered = moment(transl.deliveredOn).fromNow();
    interval = setInterval(() => {
      timeSinceDelivered = moment(transl.deliveredOn).fromNow();
      dateNow = Date.now();
    }, 60000);

    return () => clearInterval(interval);
  });
</script>

<style>
  .grid {
    display: grid;
    grid-template-columns: 40% 20% 40%;
    grid-template-rows: repeat(auto-fill, 25%);
    align-items: center;
    margin: 10px;
  }
</style>

<div class="grid">
  <div>
    <strong>{shortenHash(translHash)}</strong>
  </div>
  <div>Ξ{fromWeiToEther(web3, transl.price)}</div>
  <div>
    {#if type === 'pending'}
      {#if dateNow - transl.deliveredOn > 1000 * 60 * 60 * 24 * 5 || (transl.status && transl.status === 'approved')}
        <span
          on:click={() => dispatch('requestPayout', translHash)}
          style="cursor:pointer">
          Ready for pay out
          <img
            src="images/ethereum-icon.png"
            alt="ethereum"
            style="vertical-align:middle;margin-left:5px" />
        </span>
      {:else}Delivered {timeSinceDelivered}{/if}
    {:else if type === 'paidout'}Added to your balance{/if}
  </div>
</div>
