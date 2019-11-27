<script>
  import Modal from "../Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import Button from "../Button.svelte";

  export let type;
  export let size;
  let message = "";

  const dispatch = createEventDispatcher();

  switch (type) {
    case "no-metamask":
      message = "You must be connected to MetaMask to perform this action.";
      break;
  }

  const close = () => {
    dispatch("close", true);
  };
</script>

<Modal on:close={close} type="warning" {size}>
  <span slot="title">Warning</span>
  <div slot="body">{message}</div>
</Modal>
