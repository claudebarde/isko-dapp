<script>
  import { fly, slide } from "svelte/transition";
  import { afterUpdate, onDestroy } from "svelte";
  import firebase from "firebase";
  import { link, push } from "svelte-spa-router";
  import Navbar from "../Navbar/Navbar.svelte";
  import Modal from "../Components/Modal.svelte";
  import JobEntry from "../Components/JobEntry.svelte";
  import web3Store from "../stores/web3-store";
  import eventsStore from "../stores/events-store";
  import userStore from "../stores/user-store";
  import { fromWeiToEther } from "../utils/functions";

  let availableJobs = [];
  let noJobAvailable = false;
  let loadingMarketError = false;
  let jobsFetched = false;
  let showCommentsFor = 0;
  let unsuscribeToMarketUpdate = undefined;
  let claimingJob = false;
  let claimingJobError = false;
  let claimingJobErrorMsg =
    "<p>There was an error when claiming this job.</p><p>This can happen if the job is not available anymore or has been cancelled.</p>";
  let claimingJobSuccess = false;
  let jobEntryDelay = 0;

  const claimJob = async jobID => {
    const {
      currentAddress,
      web3,
      contractAddress,
      contractInstance
    } = $web3Store;
    let txHash;
    // opens modal
    claimingJob = true;
    // accepts job in smart contract
    // prepares transaction parameters
    let tx_builder = contractInstance.methods.acceptJob(jobID);
    let encoded_tx = tx_builder.encodeABI();
    let txObject = [
      {
        data: encoded_tx,
        from: currentAddress.toLowerCase(),
        to: contractAddress
      }
    ];
    // sends transaction
    try {
      ethereum.sendAsync(
        {
          method: "eth_sendTransaction",
          params: txObject,
          from: currentAddress.toLowerCase()
        },
        async (err, receipt) => {
          if (err) {
            console.log(err);
            claimingJobError = true;
            return;
          }

          if (receipt.result) {
            txHash = receipt.result;
            // gets translator's token
            const idToken = await firebase.auth().currentUser.getIdToken(true);
            // sends jobID to backend for claim
            const claimJob = firebase.functions().httpsCallable("claimJob");
            try {
              // claims job
              const result = await claimJob({ jobID, idToken });
              if (result.data.error === true) {
                console.log("txHash:", txHash);
                claimingJobError = true;
                claimingJobSuccess = false;
                if (result.data.msg) {
                  claimingJobErrorMsg = result.data.msg;
                } else {
                  claimingJobErrorMsg =
                    "<p>There was an error when claiming this job.</p><p>This can happen if the job is not available anymore or has been cancelled.</p>";
                }
              } else {
                claimingJobSuccess = true;
                claimingJobError = false;
                setTimeout(() => push(`/translate/${jobID}`), 2300);
              }
            } catch (err) {
              claimingJobError = true;
              claimingJobSuccess = false;
            }
          } else {
            claimingJobError = true;
            return;
          }
        }
      );
    } catch (error) {
      console.log(error);
      claimingJobError = true;
    }
  };

  const updateAvailableJobs = async change => {
    if (change.type === "added") {
      // verifies job price with data from blockchain
      const job = await $web3Store.contractInstance.methods
        .jobs(change.doc.id)
        .call();
      const price = job.price
        ? fromWeiToEther($web3Store.web3, job.price)
        : "error";
      // updates available jobs
      availableJobs = [
        { ...change.doc.data(), id: change.doc.id, price },
        ...availableJobs
      ];
    } else if (change.type === "removed") {
      availableJobs = availableJobs.filter(job => job.id !== change.doc.id);
    }
  };

  afterUpdate(async () => {
    if (
      $userStore.accountType &&
      $userStore.accountType !== "visitor" &&
      $userStore.info &&
      !jobsFetched
    ) {
      // import jobs
      try {
        const db = firebase.firestore();
        let snapShot;
        if ($userStore.accountType === "translator") {
          unsuscribeToMarketUpdate = await db
            .collection("jobMarket")
            .where("fromLang", "==", $userStore.info.languagePairs[0].from)
            .where("toLang", "==", $userStore.info.languagePairs[0].to)
            .orderBy("timestamp")
            .onSnapshot(snapShot => {
              if (snapShot.docChanges().length === 0) noJobAvailable = true;
              snapShot.docChanges().forEach(change => {
                updateAvailableJobs(change);
              });
            });
        } else {
          unsuscribeToMarketUpdate = await db
            .collection("jobMarket")
            .orderBy("timestamp")
            .onSnapshot(snapShot => {
              if (snapShot.docChanges().length === 0) noJobAvailable = true;
              snapShot.docChanges().forEach(change => {
                updateAvailableJobs(change);
              });
            });
        }
      } catch (err) {
        console.log(err);
        loadingMarketError = true;
        eventsStore.toggleWarningModal(
          "An error has occurred while downloading the new jobs!"
        );
        return;
      }
      jobsFetched = true;
    }
  });

  onDestroy(() => {
    if (unsuscribeToMarketUpdate) unsuscribeToMarketUpdate();
  });
</script>

<style>
  h1,
  h3 {
    text-align: center;
  }

  .job {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 60%;
    margin: 10px;
    padding: 1rem;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: margin 400ms;
  }

  .job:hover {
    margin: 10px 10px 10px 30px;
  }

  .new-transl {
    justify-content: center !important;
    border-left: solid 6px #2f855a;
  }

  .new-transl a {
    text-decoration: none;
    font-weight: bold;
  }

  .loader {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 10px;
  }

  .success-icon {
    width: 100%;
    text-align: center;
  }

  .success-icon img {
    width: 24px;
    height: 24px;
  }

  .no-access {
    width: 60%;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  .picture {
    width: 50%;
    margin-bottom: 40px;
  }

  .market-pic {
    text-align: center;
  }
  .market-pic img {
    width: 300px;
  }

  @media (max-width: 1024px) {
    .job {
      width: 95%;
    }
  }
</style>

{#if $userStore.accountType === 'visitor'}
  <main>
    <div class="no-access">
      <img src="images/undraw_ethereum.svg" alt="ethereum" class="picture" />
      <p>You must be logged in to view the jobs list!</p>
    </div>
  </main>
{:else}
  {#if claimingJob && !claimingJobError && !claimingJobSuccess}
    <!-- claiming job has been sent, waiting-->
    <Modal type="info" size="small" on:close={() => (claimingJob = false)}>
      <div slot="title">Claiming This Job</div>
      <div slot="body">
        <p>We are checking if the translation is available.</p>
        <p>
          You will be refunded the gas fee if you are not the first one to claim
          it.
        </p>
        <p>This may take a couple of minutes.</p>
        <p>Please don't close the window.</p>
        <div class="loader">
          <div class="dot-typing" />
        </div>
      </div>
    </Modal>
  {:else if claimingJob && claimingJobError && !claimingJobSuccess}
    <!--error after claiming job-->
    <Modal type="error" size="small" on:close={() => (claimingJob = false)}>
      <div slot="title">Claiming This Job</div>
      <div slot="body">
        {@html claimingJobErrorMsg}
      </div>
    </Modal>
  {:else if claimingJob && !claimingJobError && claimingJobSuccess}
    <!-- success after claiming job-->
    <Modal type="success" size="small" on:close={() => (claimingJob = false)}>
      <div slot="title">Claiming This Job</div>
      <div slot="body">
        <p>Congratulations, you claimed this translation!</p>
        <p>We are redirecting you to the translation interface.</p>
        <p class="success-icon">
          <img src="images/thumbs-up.svg" alt="thumbs-up" />
        </p>
      </div>
    </Modal>
  {/if}
  <main>
    <h1>Market Page</h1>
    <div class="market-pic">
      <img
        src="images/undraw_shared_workspace.svg"
        alt="market"
        class="market-pic" />
    </div>
    <h3>Find here all the translation jobs</h3>
    <div class="account-container">
      {#if $userStore.accountType === 'customer'}
        <div class="job new-transl">
          <a class="success-text" href="/order" use:link>
            Order A New Translation
          </a>
        </div>
      {/if}
      {#each availableJobs as job, index (job.id)}
        <JobEntry
          {job}
          on:claimJob={event => claimJob(event.detail)}
          delay={(() => {
            jobEntryDelay += 50;
            return jobEntryDelay;
          })()} />
      {:else}
        {#if loadingMarketError}
          <p class="job">Could not load new translation jobs!</p>
        {:else if noJobAvailable}
          <p class="job">
            There are no jobs available for now, come back later!
          </p>
        {:else}
          <p class="job" out:fly={{ y: 200, duration: 500 }}>Loading jobs...</p>
        {/if}
      {/each}
    </div>
  </main>
{/if}
