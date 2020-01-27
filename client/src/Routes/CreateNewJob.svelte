<script>
  import langs from "langs";
  import { push } from "svelte-spa-router";
  import firebase from "firebase";
  import uuidv4 from "uuid/v4";
  import Navbar from "../Navbar/Navbar.svelte";
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import eventsStore from "../stores/events-store";
  import Button from "../Components/Button.svelte";
  import Modal from "../Components/Modal.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { sendTxAndWait } from "../utils/sendTxAndWait";
  import { validMIMEtypes } from "../utils/utils";
  import { validateFile } from "../utils/functions";

  // only customer account have access to this page
  if ($userStore.accountType && $userStore.accountType !== "customer")
    push("/");

  let jobType = undefined;
  let supportType = undefined;
  let textInput = "";
  let extraQuality = false;
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
  let contentType = "Generic Content";
  let contentTypeOptions = [
    "Generic Content",
    "App/Website Interface",
    "Legal",
    "Games",
    "Product Description",
    "News, Publishing",
    "IT, Technical",
    "Medical",
    "Glossary, Keywords",
    "Customer Reviews",
    "Arts, Music",
    "Finance",
    "Marketing",
    "Cryptocurrency",
    "Social Media",
    "Food and Drink",
    "Other"
  ];
  let textPrice = 0;
  let filePrice = 0;
  let textInputSizeError = false;
  let insufficientFunds = false;
  let reviewJob = true;
  let validationModal = false;
  let savedToTheBlockchain = null;
  let savedToTheAccount = null;
  let newBlocksSubscription = undefined;
  let txFailed = false;

  const checkFile = event => {
    const output = validateFile(event.target.files[0]);
    selectedFile = { ...output.selectedFile };
    textInput = output.textInput;
  };

  // watches change in job type to adapt price for file translation
  $: if (jobType || extraQuality || selectedFile || textInput) {
    if (supportType === "file" && selectedFile.type) {
      let price = 0;
      if (extraQuality) {
        price = selectedFile.size * 0.0006;
      } else {
        price = selectedFile.size * 0.0004;
      }
      filePrice = price / ethPrice;
      filePrice = Math.round(filePrice * 10000) / 10000;
    } else if (supportType === "text") {
      const sizeInBytes = new Blob([textInput]).size;
      // not more than 60 kB
      if (sizeInBytes / 1024 / 1024 <= 0.06) {
        textInputSizeError = false;
        let feeInCents = 0;
        if (jobType === "translation") {
          if (extraQuality) {
            feeInCents = 0.05;
          } else {
            feeInCents = 0.03;
          }
        } else if (jobType === "proofreading") {
          feeInCents = 0.02;
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
        if (wordsPerText > 0) {
          textPrice =
            wordsPerText * $web3Store.web3.utils.fromWei(feePerWord, "ether");
        } else {
          textPrice = 0;
        }
        textPrice = Math.round(textPrice * 10000) / 10000;
      } else {
        textInputSizeError = true;
      }
    }
    // checks if user has enough funds
    const price = supportType === "text" ? textPrice : filePrice;
    (async () => {
      if ($web3Store.web3 && $web3Store.currentAddress) {
        // fetches current balance
        let balance = 0;
        balance = await $web3Store.web3.eth.getBalance(
          $web3Store.currentAddress
        );
        if (balance <= price) {
          insufficientFunds = true;
        } else {
          insufficientFunds = false;
        }
      }
    })();
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
    duedate &&
    textInputSizeError === false &&
    insufficientFunds === false
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

  // unsubscribes the subscription to new block headers
  /*const newBlockUnsubscribe = () => {
    newBlocksSubscription.unsubscribe(function(error, success) {
      if (success) {
        //console.log("Successfully unsubscribed!");
      } else {
        console.log(error);
      }
    });
  };*/

  // listens to tx failure to unsuscribe from new block header
  $: if (txFailed) {
    //newBlockUnsubscribe();
    validationModal = false;
    eventsStore.toggleWarningModal(
      `Your transaction could not be processed. Please try again later.`
    );
  }

  // post new job
  const validateJob = async () => {
    // checks if user is connected to main network
    if (
      parseInt(ethereum.networkVersion) !== 1 &&
      process.env.NODE_ENV !== "development"
    ) {
      validationModal = false;
      eventsStore.toggleWarningModal(
        "You must be connected to Ethereum main network to proceed!"
      );
      return;
    }

    const {
      web3,
      currentAddress,
      contractAddress,
      contractInstance
    } = $web3Store;
    let data = {
      jobType,
      supportType,
      price:
        supportType === "text"
          ? parseInt(web3.utils.toWei(textPrice.toString(), "ether"))
          : parseInt(web3.utils.toWei(filePrice.toString(), "ether")),
      content: supportType === "text" ? textInput : null,
      fromLang,
      toLang,
      duedate,
      comments: !!comments
        ? [{ from: "customer", text: comments, timestamp: Date.now() }]
        : [],
      extraQuality,
      contentType
    };
    savedToTheBlockchain = false; // display message
    reviewJob = false; // display progression
    // creates unique id
    let jobID = supportType === "text" ? "tt-" : "fi-" + uuidv4();
    // creates and sends transaction
    try {
      const result = await sendTxAndWait({
        web3,
        contractInstance,
        currentAddress,
        contractAddress,
        method: "addNewJob",
        methodParameters: [currentAddress.toLowerCase(), jobID],
        value: web3.utils.numberToHex(data.price)
      });
      if (result.result === "tx_included") {
        const { txHash } = result;
        // we update saving translation status
        savedToTheBlockchain = true;
        savedToTheAccount = false;
        try {
          // generates unique id token
          const idToken = await firebase.auth().currentUser.getIdToken(true);
          if (supportType === "file") {
            // uploads file first before saving job
            // creates reference to storage
            const storage = firebase.storage().ref();
            // creates file reference
            const ref = storage.child(
              `${$userStore.info.uid}/${selectedFile.name}`
            );
            // uploads file
            const snapshot = await ref.put(selectedFile.file);
            //console.log(snapshot);
            if (snapshot.state !== "success")
              throw new Error("Couldn't upload the file!");
            data = {
              ...data,
              content: {
                contentType: snapshot.metadata.contentType,
                fullPath: snapshot.metadata.fullPath,
                name: snapshot.metadata.name,
                size: snapshot.metadata.size
              }
            };
          }
          data = { ...data, jobID, txHash, idToken };
          // saves job to database
          const saveNewJob = firebase.functions().httpsCallable("saveNewJob");
          const result = await saveNewJob(data);
          console.log(result);
          if (result.data === true) {
            // job saved
            savedToTheAccount = true;
            setTimeout(() => (validationModal = false), 1000);
            // updates customer's info
            let newBalance = await web3.eth.getBalance(
              $web3Store.currentAddress
            );
            newBalance = newBalance.split(".");
            newBalance =
              newBalance.length > 1
                ? newBalance[0] + "." + newBalance[1].slice(0, 2)
                : newBalance[0];
            /*userStore.updateAccountInfo({
                ...$userStore.info,
                totalPaid:
                  parseInt($userStore.info.totalPaid) + parseInt(data.price),
                lastJob: jobID,
                jobs: [...$userStore.info.jobs, jobID],
                balance: newBalance
              });*/
            // if everything is fine, we send customer back to their account page
            setTimeout(() => push("/account"), 600);
          } else {
            // error
            validationModal = false;
            reviewJob = true;
            eventsStore.toggleWarningModal(
              `An error has occurred. Please contact customer service with the following transaction number: ${txHash}`
            );
          }
        } catch (error) {
          console.log(error);
          validationModal = false;
          reviewJob = true;
          let msg = "";
          if (!txHash) {
            msg =
              "Your order could not be saved on the blockchain.<br><br>Please try again later";
          } else {
            msg = `Your order could not be added to your account. Please refresh the page.<br><br>If the problem persists, please contact customer service with the following transaction number: ${txHash}`;
          }
          eventsStore.toggleWarningModal(msg);
        }
      } else {
        throw new Error(result);
      }
    } catch (error) {
      console.log(error);
      txFailed = true;
      validationModal = false;
      reviewJob = true;
      return;
    }
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
    align-items: stretch;
    align-content: stretch;
  }

  label {
    margin-right: 20px;
  }

  .textarea-input {
    width: 75%;
    display: flex;
    flex-direction: column;
  }

  #file-input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .price-output {
    width: 20%;
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  .price-output p {
    margin: 2px;
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
    float: left;
    font-size: 0.7rem;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
  }

  .modal-body__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .comment-input {
    width: 100%;
  }

  .comment-input textarea {
    width: 70%;
  }

  .comment-input p {
    margin: 20px 0px 5px 0px;
  }

  .review-job {
    display: grid;
    grid-template-columns: 40% 60%;
    justify-items: stretch;
    grid-gap: 0px 0px;
  }

  .review-job div {
    border-bottom: solid 1px #cbd5e0;
    padding: 10px;
  }

  .no-access {
    text-align: center;
  }

  .picture {
    width: 50%;
    margin-bottom: 40px;
  }
</style>

{#if !firebase.auth().currentUser}
  <main>
    <div class="container no-access">
      <img src="images/undraw_ethereum.svg" alt="ethereum" class="picture" />
      <p>You must be logged in to create a new job!</p>
    </div>
  </main>
{:else}
  {#if validationModal}
    <Modal type="info" size="small" on:close={() => (validationModal = false)}>
      <div slot="title">New Job Creation</div>
      <div slot="body">
        {#if reviewJob}
          <!-- Customer reviews new job -->
          <div class="review-job">
            <div>Type of job</div>
            <div>{jobType[0].toUpperCase() + jobType.slice(1)}</div>
            <div>From {langs.where('3', fromLang).name}</div>
            <div>To {langs.where('3', toLang).name}</div>
            <div>Content Type</div>
            <div>{contentType}</div>
            <div>Comments</div>
            <div>{!!comments ? `"${comments}"` : 'No comment'}</div>
            <div>Due in</div>
            <div>
              {#if duedate === 60 * 60}
                1 hour
              {:else if duedate === 60 * 60 * 5}
                5 hours
              {:else if duedate === 60 * 60 * 12}
                12 hours
              {:else if duedate === 60 * 60 * 24}
                24 hours
              {:else if duedate === 60 * 60 * 24 * 2}
                2 days
              {:else if duedate === 60 * 60 * 24 * 4}
                4 days
              {:else if duedate === 60 * 60 * 24 * 7}1 week{/if}
            </div>
            <div>Total Price</div>
            <div>{supportType === 'text' ? textPrice : filePrice} ethers</div>
          </div>
          <div class="footer">
            <Button type="success" text="Order" on:click={validateJob} />
          </div>
        {:else}
          <!-- New job has been approved -->
          {#if savedToTheBlockchain}
            <p>1- Your order is successfully saved in the blockchain!</p>
          {/if}
          {#if savedToTheAccount}
            <p>2- Your order is successfully saved in your account!</p>
          {/if}
          {#if savedToTheBlockchain === false}
            <div class="modal-body__content">
              <p>
                1- Saving your order to the blockchain, please don't leave or
                refresh the page.
                <br />
                This may take a few minutes.
              </p>
              <br />
              <div class="dot-typing" />
              <br />
            </div>
          {/if}
          {#if savedToTheAccount === false}
            <div class="modal-body__content">
              <p>2- Saving your order to your account.</p>
              <br />
              <div class="dot-typing" />
              <br />
            </div>
          {/if}
        {/if}
      </div>
    </Modal>
  {/if}
  <main>
    <div class="container">
      <h1>Create a new job</h1>
      <div class="inputs">
        <div>
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
        <div>
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
                  selectedFile = { size: undefined, type: undefined, name: 'Choose a file' };
                  supportType = 'file';
                  filePrice = 0;
                } else {
                  textInput = '';
                  supportType = 'text';
                  textPrice = 0;
                }
              }} />
            <label for="checkbox-text" class="css-label med elegant">
              Text
            </label>
            <input
              type="checkbox"
              value="file"
              class="css-checkbox med"
              id="checkbox-file"
              checked={supportType === 'file'}
              on:change={() => {
                if (supportType === 'file') {
                  textInput = '';
                  supportType = 'text';
                  textPrice = 0;
                } else {
                  selectedFile = { size: undefined, type: undefined, name: 'Choose a file' };
                  supportType = 'file';
                  filePrice = 0;
                }
              }} />
            <label for="checkbox-file" class="css-label med elegant">
              File
            </label>
          </p>
        </div>
        <div>
          <p>Content Type</p>
          <p>
            <select name="contentType" bind:value={contentType}>
              {#each contentTypeOptions as option}
                <option>{option}</option>
              {/each}
            </select>
          </p>
        </div>
      </div>
      {#if jobType && supportType === 'text'}
        <div
          transition:slide={{ y: 200, duration: 500 }}
          style="margin-top:25px;">
          <div class="inputs">
            <div class="textarea-input">
              <textarea
                name="text-input"
                id="text-input"
                rows="6"
                bind:value={textInput}
                placeholder="Enter your text here..."
                on:input={event => (textInput = event.target.value)} />
              <p class={`note ${textInputSizeError ? 'warning-text' : ''}`}>
                Maximum 60 kB
              </p>
            </div>
            <div class="price-output">
              <p>Total Price</p>
              <br />
              <p class:danger-text={insufficientFunds} class="price">
                <span>{textPrice}</span>
                <span>ethers</span>
              </p>
              <p>
                ({`~$${Math.round(parseFloat(textPrice) * parseFloat(ethPrice) * 100) / 100}`})
              </p>
              {#if insufficientFunds}
                <p style="font-size: 0.7rem">
                  You don't have enough ethers to create this job.
                </p>
              {/if}
            </div>
          </div>
          <div class="inputs" style="margin-top:25px" />
        </div>
      {:else if jobType && supportType === 'file'}
        <div transition:slide={{ y: 200, duration: 500 }}>
          <div class="inputs">
            <label for="file-input">Please choose the file to translate:</label>
            <input
              type="file"
              id="file-input"
              name="file-input"
              accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, .rtf, .csv"
              on:change={checkFile} />
            <label for="file-input">
              <h4 style="cursor:pointer">{selectedFile.name}</h4>
            </label>
          </div>
          <div class="inputs">
            <p>Price</p>
            <p class:danger-text={insufficientFunds} class="price">
              <span>{filePrice}</span>
              <span>ethers</span>
              <span>
                ({`~$${Math.round(parseFloat(filePrice) * parseFloat(ethPrice) * 100) / 100}`})
              </span>
              {#if insufficientFunds}
                <br />
                <span style="font-size: 0.7rem">
                  You don't have enough ethers to create this job.
                </span>
              {/if}
            </p>
          </div>
        </div>
      {/if}
      {#if jobType && supportType}
        <div class="inputs">
          <div>
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
          <div>
            <p>
              <input
                type="checkbox"
                class="css-checkbox med"
                id="checkbox-regular-quality"
                checked={!extraQuality}
                on:change={() => (extraQuality = false)} />
              <label
                for="checkbox-regular-quality"
                class="css-label med elegant">
                Regular Quality
              </label>
            </p>
            <p>
              <input
                type="checkbox"
                class="css-checkbox med"
                id="checkbox-extra-quality"
                checked={extraQuality}
                on:change={() => (extraQuality = true)} />
              <label for="checkbox-extra-quality" class="css-label med elegant">
                Extra Quality
              </label>
            </p>
          </div>
          <div>
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
        </div>
        <div class="inputs">
          <div class="comment-input">
            <p>
              Please type your comments to help us give you the best translation
            </p>
            <textarea
              name="comments-input"
              id="comments-input"
              rows="2"
              placeholder="Enter your comments here..."
              bind:value={comments}
              on:input={event => (comments = event.target.value.slice(0, 200))} />
          </div>
        </div>
        <p class={`note ${comments.length >= 200 ? 'warning-text' : ''}`}>
          Maximum 200 characters
        </p>
        <div class="footer">
          <Button
            type={saveButtonActive ? 'info' : 'disabled'}
            text="Review"
            on:click={() => (validationModal = true)} />
        </div>
      {/if}
    </div>
  </main>
{/if}
