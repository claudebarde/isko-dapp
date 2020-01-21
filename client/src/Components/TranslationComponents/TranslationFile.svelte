<script>
  import { onMount, createEventDispatcher } from "svelte";
  import firebase from "firebase";
  import Button from "../Button.svelte";
  import { validateFile } from "../../utils/functions";
  import { jobStatuses } from "../../utils/utils";
  import eventsStore from "../../stores/events-store";
  import Modal from "../Modal.svelte";

  export let content;
  export let smContractInfo;

  let fileType = "";
  let fileSize = 0;
  let fileLink = "";
  let file = undefined;
  const dispatch = createEventDispatcher();
  let confirmationModal = false;

  const checkFile = async event => {
    const output = validateFile(event.target.files[0]);
    console.log(output);
    if (!output.error) {
      // if file is valid, we update the translation status on the blockchain
      confirmationModal = true;
      file = output.selectedFile;
    } else {
      // error with file
      eventsStore.toggleWarningModal(output.error.msg);
    }
  };

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
      case "text/csv":
        fileType = ".csv";
        break;
      default:
        fileType = "unknown";
        break;
    }
    // calculates size
    fileSize = Math.round(content.size / 1024);
    // gets file link
    if (Array.isArray(content.url) && content.url.length > 0) {
      fileLink = content.url[0];
    }
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

  .title img {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    vertical-align: middle;
  }

  .download-link {
    text-decoration: none;
    padding: 0px;
    margin: 0px;
    color: inherit;
    font-style: inherit;
  }

  #file-input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .modal-buttons {
    float: right;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }

  .modal-buttons .button {
    margin: 0px 10px;
    padding: 0px;
  }
</style>

{#if confirmationModal}
  <Modal
    type="warning"
    size="small"
    on:close={() => (confirmationModal = false)}>
    <div slot="title">Upload Confirmation</div>
    <div slot="body">
      <p>Are you sure you want to submit this file?</p>
      <p>
        Once submitted, you won't be able to modify or correct your translation.
      </p>
      <div class="modal-buttons">
        <div class="button">
          <Button
            type="error"
            text="Upload"
            on:click={() => {
              confirmationModal = false;
              dispatch('submitFile', { type: 'file', file });
            }} />
        </div>
        <div class="button">
          <Button
            type="info"
            text="Cancel"
            on:click={() => (confirmationModal = false)} />
        </div>
      </div>
    </div>
  </Modal>
{/if}
<div class="container">
  <p class="title">
    <img src="images/download.svg" alt="download" />
    Download the translation
  </p>
  <div class="transl-file-elements">
    <p>
      <a href={fileLink} download={content.name} class="download-link">
        <Button type="success" text="Download file" />
      </a>
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
  <p class="title">
    <img src="images/upload.svg" alt="upload" />
    Upload your translation
  </p>
  <div class="transl-file-elements">
    <p>
      <input
        type="file"
        id="file-input"
        name="file-input"
        accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, .rtf, .csv"
        on:change={checkFile} />
      <label for="file-input">
        <Button
          type={smContractInfo && parseInt(smContractInfo.status) > 1 ? 'disabled' : 'success'}
          text="Upload Translation"
          on:click={() => document.getElementById('file-input').click()} />
      </label>
    </p>
    <p>
      {#if smContractInfo && parseInt(smContractInfo.status) > 1}
        <strong>
          {smContractInfo ? `This job appears as "${jobStatuses[smContractInfo.status]}" in the blockchain!` : 'Loading job status'}
        </strong>
      {:else}
        <strong>
          You won't be able to modify your work after uploading it!
        </strong>
      {/if}
    </p>
  </div>
  <hr />
  <p class="title">
    <img src="images/x-circle.svg" alt="cancel" />
    Cancel the translation
  </p>
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
