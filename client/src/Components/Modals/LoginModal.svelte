<script>
  import firebase from "firebase";
  import { createEventDispatcher } from "svelte";
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";
  import Alert from "../Alert.svelte";

  const dispatch = createEventDispatcher();

  let email = "";
  let password = "";
  let buttonType = "info";
  let buttonText = "Log In";
  let error = false;
  let errorText = "";

  const close = () => {
    dispatch("close", true);
  };

  const login = async () => {
    buttonText = "Loading...";
    buttonType = "loading";
    error = false;
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      // closes sign up modal
      close();
    } catch (err) {
      console.log(err);
      if (err.message) {
        errorText = err.message;
      } else {
        errorText = "Unable to log you in, please try again later.";
      }
      error = true;
      buttonText = "Log In";
      buttonType = "info";
    }
  };
</script>

<style>
  .form-input {
    display: flex;
    flex-direction: column;
    margin-bottom: 1px;
  }

  .form-input input {
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: solid 1px #cbd5e0;
    font-size: 1rem;
  }

  .footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
  }
</style>

<Modal on:close={close} size="small" type="info">
  <span slot="title">Log in to your account</span>
  <div slot="body">
    <div class="form-input">
      <label for="email">Email Address</label>
      <input type="email" id="email" bind:value={email} />
    </div>
    <div class="form-input">
      <label for="email">Password</label>
      <input type="password" id="password" bind:value={password} />
    </div>
    {#if error}
      <Alert type="error" text={errorText} hasDot={false} />
    {/if}
    <div class="footer">
      <Button text={buttonText} type={buttonType} on:click={login} />
    </div>
  </div>
</Modal>
