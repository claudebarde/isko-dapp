<script>
  import firebase from "firebase";
  import Button from "./Button.svelte";

  export let close;
  export let error;
  export let jobID;

  let feedbackStars = 0;
  let feedbackSent = false;
  let feedbackSaved = false;

  const submitFeedback = async () => {
    feedbackSent = true;
    // submits feedback
    const sendFeedback = firebase.functions().httpsCallable("sendFeedback");
    const idToken = await firebase.auth().currentUser.getIdToken(true); // generates unique id token
    const result = await sendFeedback({
      jobID,
      idToken,
      feedback: feedbackStars
    });
    if (result.data.error === false) {
      feedbackSaved = true;
      setTimeout(close, 3000);
    } else {
      error(result.msg);
    }
  };
</script>

<style>
  .buttons {
    float: right;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }

  .buttons .button {
    margin: 0px 10px;
    padding: 0px;
  }

  .stars-container {
    margin: 20px;
    text-align: center;
  }
  .stars-container img {
    margin: 5px;
    width: 30px;
    cursor: pointer;
  }
</style>

{#if feedbackSaved}
  <div>Your feedback has been successfully saved!</div>
  <br />
  <br />
  <div>
    Thank you very much for taking time and helping us provide you with a better
    experience and service!
  </div>
{:else}
  <div>
    Please let us know how satisfied you are with the translation and the
    translator's service.
  </div>
  <div class="stars-container">
    <img
      src={`images/${feedbackStars > 0 ? 'star-yellow.svg' : 'star.svg'}`}
      alt="star"
      on:click={() => (feedbackStars = 1)} />
    <img
      src={`images/${feedbackStars > 1 ? 'star-yellow.svg' : 'star.svg'}`}
      alt="star"
      on:click={() => (feedbackStars = 2)} />
    <img
      src={`images/${feedbackStars > 2 ? 'star-yellow.svg' : 'star.svg'}`}
      alt="star"
      on:click={() => (feedbackStars = 3)} />
    <img
      src={`images/${feedbackStars > 3 ? 'star-yellow.svg' : 'star.svg'}`}
      alt="star"
      on:click={() => (feedbackStars = 4)} />
    <img
      src={`images/${feedbackStars > 4 ? 'star-yellow.svg' : 'star.svg'}`}
      alt="star"
      on:click={() => (feedbackStars = 5)} />
  </div>
  <div class="buttons">
    {#if !feedbackSent}
      <div class="button">
        <Button type="warning" text="Cancel" on:click={close} />
      </div>
    {/if}
    <div class="button">
      <Button
        type={feedbackSent ? 'loading' : 'success'}
        text="Submit"
        on:click={submitFeedback} />
    </div>
  </div>
{/if}
