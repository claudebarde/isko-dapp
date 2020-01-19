<script>
  import { onMount } from "svelte";
  import {
    shortenHash,
    fromWeiToEther,
    checkJobPriority
  } from "../../../utils/functions";
  import Dot from "../../Dot.svelte";

  export let translHash;
  export let transl;
  export let web3;

  let priority = "";

  onMount(() => {
    priority = checkJobPriority({
      timestamp: transl.timestamp,
      duedate: transl.duedate
    });
  });
</script>

<style>
  .job-details {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    margin-top: 10px;
  }
</style>

<div class="job-details">
  {#if priority === 'high-priority-job'}
    <Dot type="error" />
  {:else if priority === 'medium-priority-job'}
    <Dot type="warning" />
  {:else if priority === 'low-priority-job'}
    <Dot type="success" />
  {:else}
    <span />
  {/if}
  <div>{shortenHash(translHash)}</div>
  <div>Ξ{fromWeiToEther(web3, transl.price)}</div>
  <div>
    <a href={`/#/translate/${translHash}`}>
      <img
        src="images/external-link.svg"
        class="external-link"
        alt="external link" />
    </a>
  </div>
</div>
