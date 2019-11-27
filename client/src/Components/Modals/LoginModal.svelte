<script>
  import Modal from "../Modal.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const close = () => {
    dispatch("close", true);
  };
</script>

<Modal on:close={close} size="normal">
  <span slot="title">Log in to your account</span>
</Modal>
