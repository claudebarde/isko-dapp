<script>
  import { createEventDispatcher } from "svelte";

  export let text;
  export let type;

  const dispatch = createEventDispatcher();
  $: className = type;

  const click = () => {
    className = className + "-clicked";
    setTimeout(() => {
      className = type;
      dispatch("click", true);
    }, 200);
  };
</script>

<style>
  button:focus {
    outline: 0;
  }

  button {
    color: white;
    font-weight: bold;
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    border-bottom: 1rem;
    cursor: pointer;
    font-size: 100%;
  }

  .success {
    background-color: #48bb78; /*500*/
    border: none;
    border-bottom: solid 4px #2f855a; /*700*/
  }
  .success:hover {
    background-color: #68d391; /*400*/
    border: none;
    border-bottom: solid 4px #48bb78; /*500*/
  }
  .success-clicked {
    background-color: #48bb78; /*500*/
    border: none;
    border-top: solid 4px #2f855a; /*700*/
  }

  .disabled {
    background-color: #a0aec0; /*500*/
    border: none;
    border-bottom: solid 4px #4a5568; /*700*/
  }
</style>

<button class={className || ''} disabled={type === 'disabled'} on:click={click}>
  {text}
</button>
