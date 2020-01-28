<script>
  import { fly, slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import langs from "langs";
  import moment from "moment";
  import { shortenHash, checkJobPriority } from "../utils/functions";
  import userStore from "../stores/user-store";

  export let job;
  export let delay;

  const dispatch = createEventDispatcher();
  let showComments = false;

  const claimJob = () => dispatch("claimJob", job.id);
</script>

<style>
  .job {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 60%;
    margin: 10px;
    padding: 1rem;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: margin 400ms;
  }

  .job:hover {
    margin: 10px 10px 10px 30px;
  }

  .job-details {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .job-comments {
    width: 100%;
    border: none;
    border-top: solid 1px #e2e8f0;
  }

  .icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    vertical-align: middle;
  }

  .high-priority-job {
    border-left: solid 6px #f56565;
  }

  .medium-priority-job {
    border-left: solid 6px #ed8936;
  }

  .low-priority-job {
    border-left: solid 6px #48bb78;
  }

  .duedate {
    font-size: 0.8rem;
  }

  .comments {
    font-size: 0.8rem;
    cursor: pointer;
  }

  .open-tx-hash {
    text-decoration: none;
    color: inherit;
  }

  .claim-job span {
    color: #48bb78;
    font-weight: bold;
    cursor: pointer;
  }
</style>

<div
  class={`job ${checkJobPriority({
    duedate: job.duedate,
    timestamp: job.timestamp
  })}`}
  in:fly={{ y: -400, duration: 900, delay }}>
  <div class="job-details">
    <div>
      <p>
        {#if job.supportType === 'file'}
          <img src="images/file.svg" alt="file type" class="icon" />
        {:else}
          <img src="images/file-text.svg" alt="file type" class="icon" />
        {/if}
        {`${shortenHash(job.id)}`}
      </p>
      <p>
        <em>{job.jobType[0].toUpperCase() + job.jobType.slice(1)}</em>
      </p>
      {#if $userStore.accountType === 'translator'}
        <p class="claim-job">
          <span on:click={claimJob}>Claim</span>
        </p>
      {/if}
    </div>
    <div>
      <p>
        {`${langs.where('3', job.fromLang).name} => ${langs.where('3', job.toLang).name}`}
      </p>
      <p>
        <em>{job.contentType}</em>
      </p>
    </div>
    <div style="text-align:right">
      <p>Ξ {job.price}</p>
      <p class="duedate">
        Due {moment(parseInt(job.timestamp) + parseInt(job.duedate * 1000)).fromNow()}
      </p>
      {#if job.comments.length > 0}
        <p class="comments" on:click={() => (showComments = !showComments)}>
          -> Comments
        </p>
      {/if}
    </div>
  </div>
  {#if job.comments.length > 0 && showComments}
    <div class="job-comments" transition:slide={{ x: 50, duration: 500 }}>
      {#each job.comments as comment}
        <p class="comment">
          Comment from {comment.from}:
          <em>"{comment.text}"</em>
          <span style="font-size:0.7rem">
            ({moment(comment.timestamp).format('MMM Do YYYY, h:mm:ss a')})
          </span>
        </p>
      {/each}
    </div>
  {/if}
</div>
