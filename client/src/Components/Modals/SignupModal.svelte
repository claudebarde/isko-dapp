<script>
  import { createEventDispatcher } from "svelte";
  import web3Store from "../../stores/web3-store";
  import userStore from "../../stores/user-store";
  import eventsStore from "../../stores/events-store";
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";
  import Alert from "../Alert.svelte";
  import { onMount } from "svelte";
  import firebase from "firebase";

  const dispatch = createEventDispatcher();
  let translator = true; // true if translator, false if client
  let ethPrice = 0;
  let signupFee = "0x1717b72f0a4000"; // default, $1 when ETH is at $140
  let signupFailed = false;
  let newBlocksSubscription = undefined;
  let txHash = undefined;
  const activeClasses = "border-l border-t border-r rounded-t text-blue-700";
  const defaultClasses = "text-blue-500 hover:text-blue-800";
  let info = {
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    password: undefined
  };
  $: checkInfo(info);
  let correctInfo = {
    correctFirstname: undefined,
    correctLastname: undefined,
    correctEmail: undefined,
    correctPassword: null
  };
  let buttonType = "disabled";
  let buttonText = "Create Account";

  const close = () => {
    dispatch("close", true);
  };

  const checkInfo = info => {
    // first name
    if (info.firstname !== undefined && info.firstname.trim().length >= 2) {
      correctInfo = { ...correctInfo, correctFirstname: true };
    } else {
      correctInfo = { ...correctInfo, correctFirstname: false };
    }
    // last name
    if (info.lastname !== undefined && info.lastname.trim().length >= 2) {
      correctInfo = { ...correctInfo, correctLastname: true };
    } else {
      correctInfo = { ...correctInfo, correctLastname: false };
    }
    // email
    const expression = /\S+@\S+/;
    if (
      info.email !== undefined &&
      expression.test(String(info.email).toLowerCase())
    ) {
      correctInfo = { ...correctInfo, correctEmail: true };
    } else {
      correctInfo = { ...correctInfo, correctEmail: false };
    }
    // password
    if (
      info.password !== undefined &&
      info.password.trim().length >= 8 &&
      info.password.toLowerCase() !== info.password &&
      /\d/.test(info.password)
    ) {
      correctInfo = { ...correctInfo, correctPassword: true };
    } else {
      correctInfo = { ...correctInfo, correctPassword: false };
    }

    const check = Object.keys(correctInfo)
      .map(key => correctInfo[key])
      .reduce((a, b) => a & b);
    // modify button type
    if (!!check) {
      buttonType = "success";
    } else {
      buttonType = "disabled";
    }
  };

  const switchTab = () => (translator = !translator);

  const checkIfEmailExists = event => {
    console.log(event.target.value);
  };

  const newBlockUnsubscribe = () =>
    newBlocksSubscription.unsubscribe(function(error, success) {
      if (success) {
        console.log("Successfully unsubscribed!");
      }
    });

  const validateForm = async () => {
    // removes error message if visible
    signupFailed = false;
    // checks if email address is valid for firebase
    try {
      const signinMethods = await firebase
        .auth()
        .fetchSignInMethodsForEmail(info.email);
      if (signinMethods.length > 0)
        throw new Error("This email address already exists!");
    } catch (error) {
      console.log(error);
      eventsStore.toggleWarningModal(
        "The email address already exists or is not correctly formatted!"
      );
      return;
    }
    // builds proper data to sign up user
    const { web3, contractInstance } = $web3Store;
    const data = {
      ...info,
      address: $web3Store.currentAddress.toLowerCase(),
      accountType: translator ? "translator" : "client",
      feedbacks: [], // array of objects {translation, note, comment}
      languagePairs: [] // array of objects {from: lang, to: lang}
    };
    // creates translator or customer account
    if (translator) {
      // TRANSLATOR
      // prepares transaction parameters
      let tx_builder = contractInstance.methods.addNewTranslator();
      let encoded_tx = tx_builder.encodeABI();
      let txObject = [
        {
          data: encoded_tx,
          from: $web3Store.currentAddress.toLowerCase(),
          to: $web3Store.contractAddress,
          value: signupFee
        }
      ];
      // subscribes to new block creation to confirm account creation
      newBlocksSubscription = web3.eth
        .subscribe("newBlockHeaders", (error, result) => {
          if (error) {
            console.log(error);
            signupFailed = true;
            return;
          }
        })
        .on("connected", function(subscriptionId) {
          // once connected, sends transaction to contract
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
                  signupFailed = true;
                  newBlockUnsubscribe();
                  return;
                }

                if (receipt.result) {
                  txHash = receipt.result;
                  console.log("tx hash:", txHash);
                  buttonType = "loading";
                  buttonText = "Loading...";
                  // display toast for pending transaction
                  eventsStore.setToastType("pendingTx");
                  eventsStore.toggleToast(true);
                } else {
                  signupFailed = true;
                  newBlockUnsubscribe();
                  return;
                }
              }
            );
          } catch (error) {
            console.log(error);
            newBlockUnsubscribe();
          }
        })
        .on("data", async blockHeader => {
          const blockHash = blockHeader.hash;
          // fetches block
          const block = await web3.eth.getBlock(blockHash);
          // gets the transactions from block
          const { transactions } = block;
          if (transactions.includes(txHash)) {
            console.log("Tx included!");
            // unsubscribe from listening to new blocks
            newBlockUnsubscribe();
            // updates user's balance (will close signup modal)
            const userBalance = await $web3Store.contractInstance.methods
              .returnTranslator($web3Store.currentAddress.toLowerCase())
              .call();
            userStore.updateBalance(userBalance);
            // register user in firebase
            const signupNewUser = firebase
              .functions()
              .httpsCallable("signupNewUser");
            const user = await signupNewUser({ ...data, signupTxHash: txHash });
            if (user.data.error) {
              // if error
              console.log(user.data);
              let message =
                "You couldn't be signed up. Please contact customer service.";
              if (user.data.error.errorInfo.message)
                message = user.data.error.errorInfo.message;
              close();
              eventsStore.toggleWarningModal(message);
            } else {
              // if user is signed up, we sign them in
              try {
                await firebase
                  .auth()
                  .signInWithEmailAndPassword(data.email, data.password);
                userStore.connectedUser(true);
                userStore.updateAccountType("translator");
                // closes sign up modal
                close();
              } catch (error) {
                console.log(error);
              }
            }
          } else {
            console.log("Tx pending!");
          }
        })
        .on("error", console.error);
    } else {
      // CUSTOMER
      buttonType = "loading";
      buttonText = "Loading...";
      try {
        // register user in firebase
        const signupNewUser = firebase
          .functions()
          .httpsCallable("signupNewUser");
        const customer = await signupNewUser(data);
        if (customer.data.error) {
          // if error
          console.log(customer.data);
          let message =
            "You couldn't be signed up. Please contact customer service.";
          if (user.data.error.errorInfo.message)
            message = customer.data.error.errorInfo.message;
          close();
          eventsStore.toggleWarningModal(message);
        } else {
          // if user is signed up, we sign them in
          await firebase
            .auth()
            .signInWithEmailAndPassword(data.email, data.password);
          userStore.connectedUser(true);
          userStore.updateAccountType("customer");
          // closes sign up modal
          close();
        }
      } catch (error) {
        console.log(error);
        close();
        eventsStore.toggleWarningModal(
          "An error has occurred, please try again later."
        );
      }
    }
  };

  onMount(async () => {
    const ethData = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum"
    );
    const ethJson = await ethData.json();
    ethPrice = ethJson[0].current_price;
    signupFee = $web3Store.web3.utils.numberToHex(
      $web3Store.web3.utils.toWei((1 / ethPrice).toFixed(4), "ether")
    );
  });
</script>

<style>
  input:focus {
    outline: 0;
  }

  .navigation {
    display: flex;
    border-bottom: solid 1px #e2e8f0;
    list-style-type: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .navigation li {
    display: inline;
    margin-right: 0.25rem;
    width: 50%;
    text-align: center;
  }

  .navigation li span {
    background-color: white;
    display: inline-block;
    padding: 1rem 0.5rem;
    margin: 0;
    font-weight: 600;
    cursor: pointer;
    width: 90%;
  }

  .active-tab {
    border-left: solid 1px #e2e8f0;
    border-top: solid 1px #e2e8f0;
    border-right: solid 1px #e2e8f0;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    color: #2b6cb0;
  }

  .inactive-tab {
    color: #4299e1;
  }
  .inactive-tab:hover {
    color: #2c5282;
  }

  .names-inputs {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: flex-start;
  }

  .names-inputs div:first-child {
    margin-right: 8px;
  }

  .names-inputs div:last-child {
    margin-left: 8px;
  }

  .form-input {
    display: flex;
    flex-direction: column;
    margin-bottom: 1px;
  }

  .form-input input {
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: solid 1px #cbd5e0;
    font-size: 1rem;
  }

  .form-input-error {
    border: solid 1px #f56565 !important;
  }

  .form-input-success {
    border: solid 1px #48bb78 !important;
  }

  label {
    font-weight: 600;
  }

  .error-message {
    font-size: 0.75rem;
    color: #f56565;
    margin: 0;
  }

  .footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
  }

  .fee-warning {
    font-size: 0.75rem;
    text-align: center;
  }

  @media (min-width: 640px) {
    .form-input {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .names-inputs {
      flex-wrap: wrap;
    }

    .names-inputs div:first-child {
      margin-right: 0px;
    }

    .names-inputs div:last-child {
      margin-left: 0px;
    }
  }
</style>

<!-- class={`${translator ? '-mb-px' : ''} mr-1 w-1/2 text-center`} -->
<Modal on:close={close} type="signup" size="normal">
  <span slot="title">Sign up</span>
  <div slot="body">
    <ul class="navigation">
      <li style={translator && 'margin-bottom: -1px'} on:click={switchTab}>
        <span class={translator ? 'active-tab' : 'inactive-tab'}>
          As a translator
        </span>
      </li>
      <li style={!translator ? 'margin-bottom: -1px' : ''} on:click={switchTab}>
        <span class={!translator ? 'active-tab' : 'inactive-tab'}>
          As a customer
        </span>
      </li>
    </ul>
    <div style="padding: 1.5rem">
      <p style="margin-top:0px">Please provide the following details:</p>
      {#if signupFailed}
        <Alert
          type="error"
          hasDot={false}
          text="An error occurred, you were not signed up, please try again." />
      {/if}
      <div style="padding-top: 1rem">
        <div class="names-inputs">
          <div class="form-input">
            <label for="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              class={info.firstname === undefined ? '' : correctInfo.correctFirstname ? 'form-input-success' : 'form-input-error'}
              on:input={event => (info = { ...info, firstname: event.target.value })} />
          </div>
          <div class="form-input">
            <label for="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              class={info.lastname === undefined ? '' : correctInfo.correctLastname ? 'form-input-success' : 'form-input-error'}
              on:input={event => (info = { ...info, lastname: event.target.value })} />
          </div>
        </div>
        <div class="form-input">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            class={info.email === undefined ? '' : correctInfo.correctEmail ? 'form-input-success' : 'form-input-error'}
            on:input={event => (info = { ...info, email: event.target.value })} />
        </div>
        <div class="form-input">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            class={info.password === undefined ? '' : correctInfo.correctPassword ? 'form-input-success' : 'form-input-error'}
            on:input={event => (info = { ...info, password: event.target.value })} />
          {#if info.password !== undefined && !correctInfo.correctPassword}
            <p class="error-message">
              Password must be 8 characters, have 1 uppercase character and 1
              number.
            </p>
          {:else}
            <p class="error-message">&nbsp;</p>
          {/if}
        </div>
        <div class="footer">
          {#if translator}
            <p class="fee-warning warning-text">
              {`A one time fee of ${(1 / ethPrice).toFixed(4)} ether will be added to your translator
            account.`}
              <br />
              You can withdraw this money any time you want but
              <br />
              your account is considered as inactive if its total balance
              reaches 0 wei.
            </p>
          {/if}
          <Button text={buttonText} type={buttonType} on:click={validateForm} />
        </div>
      </div>
    </div>
  </div>
</Modal>
