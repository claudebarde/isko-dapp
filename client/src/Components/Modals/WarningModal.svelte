<script>
  import Modal from "../Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import Button from "../Button.svelte";
  import eventsStore from "../../stores/events-store.js";

  export let size;

  const dispatch = createEventDispatcher();

  const close = () => {
    eventsStore.toggleWarningModal(undefined);
  };
</script>

<Modal on:close={close} type="warning" {size}>
  <span slot="title">Warning</span>
  <div slot="body" style="word-break: break-word">
    {@html $eventsStore.warningModalMessage || ''}
  </div>
</Modal>
