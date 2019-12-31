<script>
  import { onMount, createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";

  export let content;

  let fileType = "";
  let fileSize = 0;
  const dispatch = createEventDispatcher();

  onMount(() => {
    // prints out file type
    switch (content.contentType) {
      case "application/msword":
        fileType = ".doc";
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        fileType = ".docx";
        break;
      case "application/vnd.ms-excel":
        fileType = ".xls";
        break;
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        fileType = ".xlsx";
        break;
      case "application/pdf":
        fileType = ".pdf";
        break;
      case "text/plain":
        fileType = ".txt";
        break;
      case "application/rtf":
        fileType = ".rtf";
        break;
      default:
        fileType = "unknown";
        break;
    }
    // calculates size
    fileSize = Math.round(content.size / 1024);
  });
</script>

<style>
  .container {
    margin-top: 40px;
  }

  hr {
    margin: 30px 0px;
  }

  .transl-file-elements {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  .transl-file-elements p {
    margin: 5px 15px;
  }
</style>

<div class="container">
  <p class="title">Download the translation</p>
  <div class="transl-file-elements">
    <p>
      <Button type="success" text="Download file" />
    </p>
    <p>
      File type:
      <strong>{fileType}</strong>
    </p>
    <p>
      File size:
      <strong>{fileSize} KB</strong>
    </p>
  </div>
  <hr />
  <p class="title">Upload your translation</p>
  <div class="transl-file-elements">
    <p>
      <Button type="success" text="Upload Translation" />
    </p>
    <p>
      <strong>You won't be able to modify your work after uploading it!</strong>
    </p>
  </div>
  <hr />
  <p class="title">Cancel the translation</p>
  <div class="transl-file-elements">
    <p>
      <Button
        type="error"
        text="Cancel Translation"
        on:click={() => dispatch('cancel')} />
    </p>
    <p>
      <strong>
        The translation will become available again in the market.
      </strong>
    </p>
  </div>
</div>
