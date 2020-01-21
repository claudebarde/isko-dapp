<script>
  import moment from "moment";
  import { fly } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import Tag from "../Tag.svelte";
  import { shortenHash, fromWeiToEther } from "../../utils/functions";

  export let jobID, translationDetails, smContractInfo, web3;

  let dueTime = 0;
  let dueTimeInterval = undefined;

  onMount(() => {
    // defines dueTime
    dueTime = translationDetails.dueTime;
    // sets interval to refresh due time
    if (translationDetails.timestamp) {
      dueTime = moment(
        parseInt(translationDetails.timestamp) +
          parseInt(translationDetails.duedate * 1000)
      ).fromNow();
      dueTimeInterval = setInterval(() => {
        dueTime = moment(
          parseInt(translationDetails.timestamp) +
            parseInt(translationDetails.duedate * 1000)
        ).fromNow();
      }, 60000);
    }
  });

  onDestroy(() => clearInterval(dueTimeInterval));
</script>

<style>
  .title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
</style>

<div class="title">
  <h3>Translation #{shortenHash(jobID)}</h3>
  {#if translationDetails.supportType && smContractInfo}
    <div in:fly={{ x: 100, duration: 500 }}>
      <Tag
        type="info"
        text={`${translationDetails.fromLang}=>${translationDetails.toLang}`} />
      {#if translationDetails.extraQuality}
        <Tag type="info" text="Extra Quality" />
      {:else}
        <Tag type="info" text="Standard" />
      {/if}
      <Tag type="info" text={translationDetails.contentType} />
      <Tag type="warning" text={`Due ${dueTime}`} />
      <Tag
        type="success"
        text={`Ξ ${smContractInfo.price ? fromWeiToEther(web3, smContractInfo.price) : '...'}`} />
    </div>
  {/if}
</div>
