<script>
  import langs from "langs";
  import { push } from "svelte-spa-router";
  import firebase from "firebase";
  import Navbar from "../Navbar/Navbar.svelte";
  import web3Store from "../stores/web3-store";
  import userStore from "../stores/user-store";
  import eventsStore from "../stores/events-store";
  import Button from "../Components/Button.svelte";
  import Modal from "../Components/Modal.svelte";
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
  let initialFee = 0; // minimum fee for translation
  let textPrice = initialFee;
  let filePrice = initialFee;
  let textInputSizeError = false;
  let insufficientFunds = false;
  let reviewJob = true;
  let validationModal = false;
  let savedToTheBlockchain = null;
  let savedToTheAccount = null;
  let newBlocksSubscription = undefined;
  let txFailed = false;

  const validateSize = event => {
    const file = event.target.files[0];
    if (file && file.size / 1024 / 1024 <= 1) {
      console.log(file);
      // not more than 1 MB
      const fileSize = file.size; // in bytes
      const fileType = file.type;
      let chosenFileName = file.name;
      if (chosenFileName.length >= 20) {
        const arr = file.name.split(".");
        const extension = arr[arr.length - 1];
        chosenFileName = chosenFileName.slice(0, 15) + "(...)." + extension;
      }

      selectedFile = {
        size: fileSize,
        type: fileType,
        name: chosenFileName,
        file
      };
      const reader = new FileReader();
      // file reading finished successfully
      reader.addEventListener("load", event => {
        const text = event.target.result;
        // contents of the file
        //console.log(text);
        textInput = text;
      });
      // read as text file
      reader.readAsText(file);
    } else {
      console.log("File is over 1 MB");
    }
  };

  // watches change in job type to adapt price for file translation
  $: if (jobType || noAutoTranslation || selectedFile || textInput) {
    if (supportType === "file" && selectedFile.type) {
      const price = selectedFile.size * 0.0004;
      filePrice = price / ethPrice;
      filePrice = Math.round(filePrice * 10000) / 10000;
    } else if (supportType === "text") {
      const sizeInBytes = new Blob([textInput]).size;
      // not more than 60 kB
      if (sizeInBytes / 1024 / 1024 <= 0.06) {
        textInputSizeError = false;
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
        if (wordsPerText > 0) {
          textPrice =
            wordsPerText * $web3Store.web3.utils.fromWei(feePerWord, "ether") +
            initialFee;
        } else {
          textPrice = initialFee;
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
  const newBlockUnsubscribe = () => {
    newBlocksSubscription.unsubscribe(function(error, success) {
      if (success) {
        //console.log("Successfully unsubscribed!");
      } else {
        console.log(error);
      }
    });
  };

  // listens to tx failure to unsuscribe from new block header
  $: if (txFailed) {
    newBlockUnsubscribe();
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
      noAutoTranslation
    };
    savedToTheBlockchain = false; // display message
    reviewJob = false; // display progression
    // creates unique id
    let jobID = web3.utils.sha3(textInput);
    // prepares transaction parameters
    let tx_builder = contractInstance.methods.addNewJob(
      currentAddress.toLowerCase(),
      jobID
    );
    let encoded_tx = tx_builder.encodeABI();
    let txObject = [
      {
        data: encoded_tx,
        from: currentAddress.toLowerCase(),
        to: contractAddress,
        value: web3.utils.numberToHex(data.price)
      }
    ];
    //console.log(jobID, txObject);
    // subscribes to new block creation to confirm account creation
    let txHash;
    newBlocksSubscription = web3.eth
      .subscribe("newBlockHeaders", (error, result) => {
        if (error) {
          console.log(error);
          txFailed = true;
          return;
        }
      })
      .on("connected", subscriptionId => {
        try {
          ethereum.sendAsync(
            {
              method: "eth_sendTransaction",
              params: txObject,
              from: $web3Store.currentAddress.toLowerCase()
            },
            (err, receipt) => {
              if (err) {
                console.log(err);
                txFailed = true;
                return;
              }

              if (receipt.result) {
                txHash = receipt.result;
                //console.log("tx hash:", txHash);
              } else {
                txFailed = true;
                return;
              }
            }
          );
        } catch (error) {
          console.log(error);
          txFailed = true;
        }
      })
      .on("data", async blockHeader => {
        const blockHash = blockHeader.hash;
        // fetches block
        const block = await web3.eth.getBlock(blockHash);
        // gets the transactions from block
        const { transactions } = block;
        if (transactions.includes(txHash)) {
          console.log("Transaction included!:", { ...data, txHash, jobID });
          savedToTheBlockchain = true;
          savedToTheAccount = false;
          newBlockUnsubscribe();
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
                  name: snapshot.metadata.name
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
              userStore.updateAccountInfo({
                ...$userStore.info,
                totalPaid:
                  parseInt($userStore.info.totalPaid) + parseInt(data.price),
                lastJob: jobID,
                jobs: [...$userStore.info.jobs, jobID],
                balance: newBalance
              });
              // if everything is fine, we send customer back to their account page
              push("/account");
            } else {
              // error
              validationModal = false;
              eventsStore.toggleWarningModal(
                `An error has occurred. Please contact customer service with the following transaction number: ${txHash}`
              );
            }
          } catch (error) {
            console.log(error);
            validationModal = false;
            let msg = "";
            if (!txHash) {
              msg =
                "Your order could not be saved on the blockchain.<br><br>Please try again later";
            } else {
              msg = `Your order could not be added to your account. Please refresh the page.<br><br>If the problem persists, please contact customer service with the following transaction number: ${txHash}`;
            }
            eventsStore.toggleWarningModal(msg);
          }
        }
      })
      .on("error", error => {
        console.log(error);
        txFailed = true;
      });
  };

  onMount(async () => {
    const ethData = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum"
    );
    const ethJson = await ethData.json();
    ethPrice = ethJson[0].current_price;
    const fee = await $web3Store.contractInstance.methods.fee().call();
    initialFee = parseFloat($web3Store.web3.utils.fromWei(fee, "ether"));
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

  textarea {
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: solid 1px #cbd5e0;
    font-size: 1rem;
    resize: none;
  }

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

  .modal-body__content {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
  }

  .price {
    text-align: right;
  }
</style>

{#if validationModal}
  <Modal type="info" size="small">
    <div slot="title">New Job Creation</div>
    <div slot="body">
      {#if reviewJob}
        <!-- Customer reviews new job -->
        <div class="inputs">
          <p>Type of job: {jobType}</p>
          <p>
            From {langs.where('3', fromLang).name} to {langs.where('3', toLang).name}
          </p>
        </div>
        <div class="inputs">
          <p>Your comments:</p>
          <p>{!!comments ? comments : '--'}</p>
        </div>
        <div class="inputs">
          <p>
            Due in
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
          </p>
          <p>
            Total Price: {supportType === 'text' ? textPrice : filePrice} ethers
          </p>
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
            <div class="dot-pulse" />
          </div>
        {/if}
        {#if savedToTheAccount === false}
          <div class="modal-body__content">
            <p>2- Saving your order to your account.</p>
            <div class="dot-pulse" />
          </div>
        {/if}
      {/if}
    </div>
  </Modal>
{/if}
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
              selectedFile = { size: undefined, type: undefined, name: 'Choose a file' };
              supportType = 'file';
              filePrice = 0;
            } else {
              textInput = '';
              supportType = 'text';
              textPrice = 0;
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
              textInput = '';
              supportType = 'text';
              textPrice = 0;
            } else {
              selectedFile = { size: undefined, type: undefined, name: 'Choose a file' };
              supportType = 'file';
              filePrice = 0;
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
            rows="6"
            class="textarea-input"
            bind:value={textInput}
            on:input={event => (textInput = event.target.value)} />
        </div>
        <p class={`note ${textInputSizeError ? 'warning-text' : ''}`}>
          Maximum 60 kB
        </p>
        <div class="inputs with-border" style="margin-top:25px">
          <p>Price</p>
          <p class:danger-text={insufficientFunds} class="price">
            <span>{textPrice}</span>
            <span>ethers</span>
            <span>
              ({`~$${Math.round(parseFloat(textPrice) * parseFloat(ethPrice) * 100) / 100}`})
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
          type={saveButtonActive ? 'info' : 'disabled'}
          text="Review"
          on:click={() => (validationModal = true)} />
      </div>
    {/if}
  </div>
</main>