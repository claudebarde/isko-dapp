<script>
  import langs from "langs";
  import { push } from "svelte-spa-router";
  import Navbar from "../Navbar/Navbar.svelte";
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import Button from "../Components/Button.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { slide } from "svelte/transition";

  // only customer account have access to this page
  if ($userStore.accountType && $userStore.accountType !== "customer")
    push("/");

  let jobType = undefined;
  let supportType = undefined;
  let textInput = "";
  let noAutoTranslation = false;
  let ethPrice = undefined;
  let duedate = undefined;
  let fromLang = undefined;
  let toLang = undefined;
  let comments = "";
  let saveButtonActive = false;
  let selectedFile = {
    size: undefined,
    type: undefined,
    name: "Choose a file"
  };
  let textPrice = 0;
  let filePrice = 0;

  const validateSize = event => {
    const file = event.target.files[0];
    if (file && file.size / 1024 / 1024 <= 2) {
      // not more than 2 MB
      const fileSize = file.size; // in bytes
      const fileType = file.type;
      let chosenFileName = file.name;
      if (chosenFileName.length >= 20) {
        const arr = file.name.split(".");
        const extension = arr[arr.length - 1];
        chosenFileName = chosenFileName.slice(0, 15) + "(...)." + extension;
      }

      selectedFile = { size: fileSize, type: fileType, name: chosenFileName };
    }
  };

  // watches change in job type to adapt price for file translation
  $: if (jobType || noAutoTranslation || selectedFile || textInput) {
    if (supportType === "file" && selectedFile.type) {
      let feeInCents = 0;
      // files that are .doc or .xls have more formatting
      let wordsPerFile = 0;
      if (
        [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/pdf"
        ].includes(selectedFile.type)
      ) {
        wordsPerFile = selectedFile.size / 160;
      } else {
        wordsPerFile = selectedFile.size / 10;
      }
      // calculates price
      if (jobType === "translation") {
        if (noAutoTranslation) {
          feeInCents = 0.06;
        } else {
          feeInCents = 0.05;
        }
      } else if (jobType === "proofreading") {
        feeInCents = 0.03;
      }
      const feePerWord = ethPrice
        ? $web3Store.web3.utils.toWei(
            (feeInCents / ethPrice).toFixed(6),
            "ether"
          )
        : undefined;
      filePrice =
        wordsPerFile * $web3Store.web3.utils.fromWei(feePerWord, "ether");
      filePrice = Math.round(filePrice * 10000) / 10000;
    } else if (supportType === "text") {
      let feeInCents = 0;
      if (jobType === "translation") {
        if (noAutoTranslation) {
          feeInCents = 0.06;
        } else {
          feeInCents = 0.05;
        }
      } else if (jobType === "proofreading") {
        feeInCents = 0.03;
      }
      const feePerWord = ethPrice
        ? $web3Store.web3.utils.toWei(
            (feeInCents / ethPrice).toFixed(6),
            "ether"
          )
        : undefined;
      const wordsPerText = textInput
        .trim()
        .split(" ")
        .filter(el => el).length;
      textPrice = !!wordsPerText
        ? wordsPerText * $web3Store.web3.utils.fromWei(feePerWord, "ether")
        : 0;
      textPrice = Math.round(textPrice * 10000) / 10000;
    }
  }

  // activate save button when conditions are fulfilled
  $: if (
    jobType &&
    supportType &&
    (textPrice || filePrice) &&
    fromLang &&
    fromLang !== "default" &&
    toLang &&
    toLang !== "default" &&
    duedate
  ) {
    if (
      (supportType === "text" && !!textInput.trim()) ||
      (supportType === "file" && selectedFile.type)
    ) {
      saveButtonActive = true;
    } else {
      saveButtonActive = false;
    }
  } else {
    saveButtonActive = false;
  }

  // post new job
  const validateJob = () => {
    const { web3 } = $web3Store;
    const data = {
      jobType,
      supportType,
      price:
        supportType === "text"
          ? web3.utils.toWei(textPrice.toString(), "ether")
          : web3.utils.toWei(filePrice.toString(), "ether"),
      content: supportType === "text" ? textInput : selectedFile,
      fromLang,
      toLang,
      duedate,
      comments,
      noAutoTranslation
    };
    console.log(data);
  };

  onMount(async () => {
    const ethData = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum"
    );
    const ethJson = await ethData.json();
    ethPrice = ethJson[0].current_price;
  });
</script>

<style>
  h1 {
    text-align: center;
  }

  .container {
    width: 60%;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .inputs {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
  }

  .inputs.with-border {
    border-bottom: solid 1px #cbd5e0;
  }

  label {
    margin-right: 20px;
  }

  .textarea-input {
    width: 70%;
  }

  input[type="text"],
  textarea {
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: solid 1px #cbd5e0;
    font-size: 1rem;
    resize: none;
  }

  input[type="text"]:focus,
  textarea:focus {
    outline: none;
  }

  #file-input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .lang-pair {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .note {
    margin: 0;
    padding: 0;
    float: right;
    font-size: 0.7rem;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
  }
</style>

<main>
  <div class="container">
    <h1>Create a new job</h1>
    <div class="inputs with-border">
      <p>Type of job</p>
      <p>
        <input
          type="checkbox"
          value="text"
          class="css-checkbox med"
          id="checkbox-translation"
          checked={jobType === 'translation'}
          on:change={() => {
            if (jobType === 'translation') {
              jobType = 'proofreading';
            } else {
              jobType = 'translation';
            }
          }} />
        <label for="checkbox-translation" class="css-label med elegant">
          Translation
        </label>
        <input
          type="checkbox"
          value="file"
          class="css-checkbox med"
          id="checkbox-proofreading"
          checked={jobType === 'proofreading'}
          on:change={() => {
            if (jobType === 'proofreading') {
              jobType = 'translation';
            } else {
              jobType = 'proofreading';
            }
          }} />
        <label for="checkbox-proofreading" class="css-label med elegant">
          Proofreading
        </label>
      </p>
    </div>
    <div class="inputs">
      <p>Type of support</p>
      <p>
        <input
          type="checkbox"
          value="text"
          class="css-checkbox med"
          id="checkbox-text"
          checked={supportType === 'text'}
          on:change={() => {
            if (supportType === 'text') {
              supportType = 'file';
            } else {
              supportType = 'text';
            }
          }} />
        <label for="checkbox-text" class="css-label med elegant">Text</label>
        <input
          type="checkbox"
          value="file"
          class="css-checkbox med"
          id="checkbox-file"
          checked={supportType === 'file'}
          on:change={() => {
            if (supportType === 'file') {
              supportType = 'text';
            } else {
              supportType = 'file';
            }
          }} />
        <label for="checkbox-file" class="css-label med elegant">File</label>
      </p>
    </div>
    {#if jobType && supportType === 'text'}
      <div transition:slide={{ y: 200, duration: 500 }}>
        <div class="inputs">
          <p>Your text</p>
          <textarea
            name="text-input"
            id="text-input"
            rows="10"
            class="textarea-input"
            bind:value={textInput}
            on:input={event => (textInput = event.target.value)} />
        </div>
        <div class="inputs with-border">
          <p>Price</p>
          <div>
            <input
              type="text"
              id="translation-price"
              bind:value={textPrice}
              size="10" />
            <label for="translation-price">ether</label>
          </div>
        </div>
      </div>
    {:else if jobType && supportType === 'file'}
      <div transition:slide={{ y: 200, duration: 500 }}>
        <div class="inputs">
          <label for="file-input">Please choose the file to translate:</label>
          <input
            type="file"
            id="file-input"
            name="file-input"
            accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, .rtf"
            on:change={validateSize} />
          <label for="file-input">
            <h4 style="cursor:pointer">{selectedFile.name}</h4>
          </label>
        </div>
        <div class="inputs with-border">
          <p>Price:</p>
          <div>
            <input
              type="text"
              id="file-price"
              bind:value={filePrice}
              size="10" />
            <label for="file-price">ether</label>
          </div>
        </div>
      </div>
    {/if}
    {#if jobType && supportType}
      <div class="inputs with-border">
        <p class="lang-pair">
          <label for="from-lang">From</label>
          <select name="from-lang" id="from-lang" bind:value={fromLang}>
            <option value="default" selected="selected">Language</option>
            {#each langs.all() as item}
              <option value={item[3]}>{item.name}</option>
            {/each}
          </select>
        </p>
        <p class="lang-pair">
          <label for="to-lang">To</label>
          <select name="to-lang" id="to-lang" bind:value={toLang}>
            <option value="default" selected="selected">Language</option>
            {#each langs.all() as item}
              <option value={item[3]}>{item.name}</option>
            {/each}
          </select>
        </p>
      </div>
      <div class="inputs with-border">
        <p>No Automatic Translation Allowed?</p>
        <p>
          <input
            type="checkbox"
            value="no-auto-translation"
            class="css-checkbox med"
            id="checkbox-no-auto-translation"
            checked={noAutoTranslation}
            on:change={() => (noAutoTranslation = !noAutoTranslation)} />
          <label
            for="checkbox-no-auto-translation"
            class="css-label med elegant" />
        </p>
      </div>
      <div class="inputs with-border">
        <p>Due in</p>
        <p>
          <select name="duedate" id="duedate" bind:value={duedate}>
            <option value={60 * 60}>In 1 hour</option>
            <option value={60 * 60 * 5}>In 5 hours</option>
            <option value={60 * 60 * 12}>In 12 hours</option>
            <option value={60 * 60 * 24} selected="selected">
              In 24 hours
            </option>
            <option value={60 * 60 * 24 * 2}>In 2 days</option>
            <option value={60 * 60 * 24 * 4}>In 4 days</option>
            <option value={60 * 60 * 24 * 7}>In 1 week</option>
          </select>
        </p>
      </div>
      <div class="inputs">
        <p>Comments</p>
        <textarea
          name="comments-input"
          id="comments-input"
          rows="2"
          class="textarea-input"
          bind:value={comments}
          on:input={event => (comments = event.target.value.slice(0, 200))} />
      </div>
      <p class={`note ${comments.length >= 200 ? 'warning-text' : ''}`}>
        Maximum 200 characters
      </p>
      <div class="footer">
        <Button
          type={saveButtonActive ? 'success' : 'disabled'}
          text="Order"
          on:click={validateJob} />
      </div>
    {/if}
  </div>
</main>
