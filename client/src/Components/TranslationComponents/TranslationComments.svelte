<script>
  import moment from "moment";
  import firebase from "firebase";
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import eventsStore from "../../stores/events-store";
  import userStore from "../../stores/user-store";

  export let comments, jobID;

  const dispatch = createEventDispatcher();
  let openNewComment = false;
  let newComment = "";
  let disableNewComment = false;

  const validateComment = async event => {
    if (event.keyCode === 13) {
      disableNewComment = true;
      const comment = {
        from: $userStore.accountType,
        timestamp: Date.now(),
        text: newComment
      };
      newComment = "Saving...";
      event.preventDefault();
      try {
        // save new comment in database
        const addComment = firebase.functions().httpsCallable("addComment"); // generates unique id token
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        const result = await addComment({
          jobID,
          comment,
          idToken
        });
        if (result.data.error === false) {
          // updates local variables
          newComment = "";
          disableNewComment = false;
          openNewComment = false;
          // dispatch event with new comments
          dispatch("new-comment", comment);
        } else {
          throw new Error(result.data.msg);
        }
      } catch (error) {
        console.log(error);
        eventsStore.toggleWarningModal(
          "An error has occurred while saving your comment!"
        );
      }
    }
  };
</script>

<style>
  .comment {
    margin: 4px;
  }

  .add-comment {
    margin: 10px;
    cursor: pointer;
  }

  .add-comment img {
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }

  .rotate {
    -ms-transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  .no-rotate {
    -ms-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  .new-comment-container {
    margin: 0px;
    margin-left: 20px;
  }

  .new-comment-container textarea {
    width: 30%;
  }
</style>

{#if comments && comments.length > 0}
  <div class="comments">
    {#each comments as comment, index (comment.timestamp)}
      <p class="comment">
        Comment from {comment.from}:
        <em>"{comment.text}"</em>
      </p>
      <p class="comment" style="font-size:0.7rem">
        ({moment(comment.timestamp).format('MMM Do YYYY, h:mm:ss a')})
      </p>
    {/each}
  </div>
{/if}
<div class="add-comment" on:click={() => (openNewComment = !openNewComment)}>
  <img
    src="images/chevron-right.svg"
    alt="chevron right"
    id="comment-chevron"
    class={openNewComment ? 'rotate' : 'no-rotate'} />
  Add a comment
</div>
{#if openNewComment}
  <div
    transition:slide={{ x: 100, duration: 500 }}
    class="new-comment-container">
    <textarea
      rows="2"
      placeholder="Enter your comment here, press Enter to save..."
      maxlength="200"
      disabled={disableNewComment}
      on:keydown={validateComment}
      bind:value={newComment} />
  </div>
{/if}
