<script>
  import { onMount } from "svelte";
  import moment from "moment";
  import { shortenHash, fromWeiToEther } from "../../../utils/functions";

  export let translHash;
  export let transl;
  export let web3;
  export let type;

  let interval;
  let dateNow = Date.now();
  let timeSinceDelivered = 0;

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
      {#if dateNow - transl.deliveredOn < 1000 * 60 * 60 * 24 * 5}
        Delivered {timeSinceDelivered}
      {:else}Ready for pay out request{/if}
    {:else if type === 'paidout'}Ready for payment{/if}
  </div>
</div>
