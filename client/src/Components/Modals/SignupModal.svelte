<script>
  import { createEventDispatcher } from "svelte";
  import web3Store from "../../stores/web3-store";
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";

  //let web3 = window.web3;
  const dispatch = createEventDispatcher();
  let translator = true; // true if translator, false if client
  const activeClasses = "border-l border-t border-r rounded-t text-blue-700";
  const defaultClasses = "text-blue-500 hover:text-blue-800";
  let info = {
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    password: undefined
  };
  $: formFilled = checkInfo(info);
  let correctInfo = {
    correctFirstname: undefined,
    correctLastname: undefined,
    correctEmail: undefined,
    correctPassword: null
  };

  const close = () => {
    dispatch("close", true);
  };

  const validateForm = async () => {
    console.log({
      ...info,
      address: $web3Store.currentAddress,
      accountType: translator ? "translator" : "client"
    });
    /*const signature = await web3.personal.sign(
      web3.fromUtf8("New account registration"),
      $web3Store.currentAddress,
      (err, signature) => {
        console.log(signature);
        console.log(
          signature,
          web3.personal.ecRecover(
            "New account registration",
            signature,
            console.log
          )
        );
      }
    );*/
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

    return Object.keys(correctInfo)
      .map(key => correctInfo[key])
      .reduce((a, b) => a & b);
  };

  const switchTab = () => (translator = !translator);
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
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
  }

  @media (min-width: 640px) {
    .form-input {
      width: 100%;
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
          As a client
        </span>
      </li>
    </ul>
    <div style="padding: 1.5rem">
      <p>Please provide the following details:</p>
      <div style="padding-top: 1rem">
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
          <Button
            text="Create Account"
            type={formFilled ? 'success' : 'disabled'}
            on:click={validateForm} />
        </div>
      </div>
    </div>
  </div>
</Modal>
