<script>
  import firebase from "firebase";
  import { push } from "svelte-spa-router";
  import Navbar from "../Navbar/Navbar.svelte";
  import Alert from "../Components/Alert.svelte";
  import Button from "../Components/Button.svelte";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import eventsStore from "../stores/events-store";

  let warningType = undefined;
</script>

<style>
  .presentation,
  .presentation-reverse {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .text-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 3rem 1.5rem;
    padding: 2.5rem 0.5rem;
    text-align: center;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .text-card__image {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 1rem;
  }

  @media (min-width: 640px) {
  }

  @media (min-width: 1024px) {
    .text-card {
      width: 44%;
      margin: 0;
    }

    .text-card__image {
      width: 50%;
    }

    .presentation {
      padding: 3rem;
    }

    .presentation-reverse {
      flex-direction: row-reverse;
      padding: 3rem;
    }

    .presentation-reverse .text-card__image {
      justify-content: center;
    }
  }
</style>

<!--<div>Icons made by <a href="https://www.flaticon.com/authors/prettycons" title="prettycons">prettycons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>Icons made by <a href="https://www.flaticon.com/authors/pixelmeetup" title="Pixelmeetup">Pixelmeetup</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>-->
<main>
  {#if $web3Store.hasMetamask === false}
    <Alert
      type="warning"
      text="Please install Metamask to continue"
      hasDot={true} />
  {/if}
  <div class="presentation" in:fly={{ x: -100, duration: 500 }}>
    <div class="text-card">
      <h1>Isko Eth</h1>
      <br />
      <h3>The first blockchain connected translation app!</h3>
    </div>
    <div class="text-card__image">
      <img
        src="images/undraw_Organizing_projects_0p9a.svg"
        alt="translator"
        style="height: 16rem" />
    </div>
  </div>
  <div class="presentation-reverse" in:fly={{ x: 100, duration: 500 }}>
    <div class="text-card">
      <h1>Get your translation done!</h1>
      <br />
      <Button
        text={'Post a translation job'}
        type="teal"
        on:click={() => push('/order')} />
    </div>
    <div class="text-card__image">
      <img
        src="images/undraw_transfer_files_6tns.svg"
        alt="client"
        style="height: 14rem" />
    </div>
  </div>
  <div class="presentation" in:fly={{ x: -100, duration: 500 }}>
    <div class="text-card">
      <h1>Become a translator!</h1>
      <br />
      <Button text={'Sign up now!'} type="teal" />
    </div>
    <div class="text-card__image">
      <img
        src="images/undraw_fill_forms_yltj.svg"
        alt="sign up"
        style="height: 14rem" />
    </div>
  </div>
</main>
