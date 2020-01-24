<script>
  import moment from "moment";
  import { fly } from "svelte/transition";
  import { afterUpdate, onDestroy } from "svelte";
  import Tag from "../Tag.svelte";
  import { shortenHash, fromWeiToEther } from "../../utils/functions";

  export let jobID, translationDetails, smContractInfo, web3;

  let duedate = 0;
  let duedateInterval = undefined;

  afterUpdate(() => {
    // defines dueTime
    duedate = translationDetails.duedate;
    // sets interval to refresh due time
    if (translationDetails.timestamp) {
      duedate = moment(
        parseInt(translationDetails.timestamp) +
          parseInt(translationDetails.duedate * 1000)
      ).fromNow();
      duedateInterval = setInterval(() => {
        duedate = moment(
          parseInt(translationDetails.timestamp) +
            parseInt(translationDetails.duedate * 1000)
        ).fromNow();
      }, 60000);
    }
  });

  onDestroy(() => clearInterval(duedateInterval));
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
      {#if smContractInfo.status.toString() === '1'}
        <Tag type="warning" text={`Due ${duedate}`} />
      {:else if smContractInfo.status.toString() === '3'}
        <Tag type="purple" text="Review" />
      {/if}
      <Tag
        type="success"
        text={`Ξ ${smContractInfo.price ? fromWeiToEther(web3, smContractInfo.price) : '...'}`} />
    </div>
  {/if}
</div>
