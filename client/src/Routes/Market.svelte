<script>
  import { fly, slide } from "svelte/transition";
  import { afterUpdate, onDestroy } from "svelte";
  import firebase from "firebase";
  import moment from "moment";
  import langs from "langs";
  import { link, push } from "svelte-spa-router";
  import Navbar from "../Navbar/Navbar.svelte";
  import Modal from "../Components/Modal.svelte";
  import web3Store from "../stores/web3-store";
  import eventsStore from "../stores/events-store";
  import userStore from "../stores/user-store";
  import { shortenHash, fromWeiToEther } from "../utils/functions";

  let availableJobs = [];
  let noJobAvailable = false;
  let loadingMarketError = false;
  let jobsFetched = false;
  let showComments = false;
  let unsuscribeToMarketUpdate = undefined;
  let claimingJob = false;
  let claimingJobError = false;
  let claimingJobErrorMsg =
    "<p>There was an error when claiming this job.</p><p>This can happen if the job is not available anymore or has been cancelled.</p>";
  let claimingJobSuccess = false;

  const checkPriority = ({ duedate, timestamp }) => {
    const timeLeft =
      parseInt(timestamp) + parseInt(duedate * 1000) - Date.now();
    //console.log(timeLeft, id);
    if (timeLeft <= 18000) {
      // less than 5 hours or expired
      return "high-priority-job";
    } else if (timeLeft > 18000 && timeLeft < 172800000) {
      // between 5 hours and 48 hours
      return "medium-priority-job";
    } else {
      return "low-priority-job";
    }
  };

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
    if ($userStore.accountType && $userStore.info && !jobsFetched) {
      // import jobs
      try {
        const db = firebase.firestore();
        let snapShot;
        if ($userStore.accountType === "translator") {
          const db = firebase.firestore();
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
      /*setTimeout(() => {
        availableJobs = dataFromFirebase.filter(
          doc =>
            doc.fromLang === $userStore.info.languagePairs[0].from &&
            doc.toLang === $userStore.info.languagePairs[0].to
        );
      }, 1000);*/
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

  .job-details {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .job-comments {
    width: 100%;
    border: none;
    border-top: solid 1px #e2e8f0;
  }

  .icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    vertical-align: middle;
  }

  .high-priority-job {
    border-left: solid 6px #f56565;
  }

  .medium-priority-job {
    border-left: solid 6px #ed8936;
  }

  .low-priority-job {
    border-left: solid 6px #48bb78;
  }

  .duedate {
    font-size: 0.8rem;
  }

  .comments {
    font-size: 0.8rem;
    cursor: pointer;
  }

  .new-transl {
    justify-content: center !important;
    border-left: solid 6px #2f855a;
  }

  .new-transl a {
    text-decoration: none;
    font-weight: bold;
  }

  .open-tx-hash {
    text-decoration: none;
    color: inherit;
  }

  .claim-job span {
    color: #48bb78;
    font-weight: bold;
    cursor: pointer;
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

  @media (max-width: 1024px) {
    .job {
      width: 95%;
    }
  }
</style>

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
      <div
        class={`job ${checkPriority({
          duedate: job.duedate,
          timestamp: job.timestamp
        })}`}
        in:fly={{ y: 200, duration: 500 }}>
        <div class="job-details">
          <div>
            <p>
              {#if job.supportType === 'file'}
                <img src="images/file.svg" alt="file type" class="icon" />
              {:else}
                <img src="images/file-text.svg" alt="file type" class="icon" />
              {/if}
              {`${shortenHash(job.id)}`}
            </p>
            <p>
              <em>{job.jobType[0].toUpperCase() + job.jobType.slice(1)}</em>
            </p>
            {#if $userStore.accountType === 'translator'}
              <p class="claim-job">
                <span on:click={() => claimJob(job.id)}>Claim</span>
              </p>
            {/if}
          </div>
          <div>
            <p>
              {`${langs.where('3', job.fromLang).name} => ${langs.where('3', job.toLang).name}`}
            </p>
            <p>
              <em>{job.contentType}</em>
            </p>
          </div>
          <div style="text-align:right">
            <p>Ξ {job.price}</p>
            <p class="duedate">
              Due {moment(parseInt(job.timestamp) + parseInt(job.duedate * 1000)).fromNow()}
            </p>
            {#if job.comments.length > 0}
              <p
                class="comments"
                on:click={() => (showComments = !showComments)}>
                -> Comments
              </p>
            {/if}
          </div>
        </div>
        {#if job.comments.length > 0 && showComments}
          <div class="job-comments" transition:slide={{ x: 50, duration: 500 }}>
            {#each job.comments as comment}
              <p class="comment">
                Comment from {comment.from}:
                <em>"{comment.text}"</em>
                <span style="font-size:0.7rem">
                  ({moment(comment.timestamp).format('MMM Do YYYY, h:mm:ss a')})
                </span>
              </p>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      {#if loadingMarketError}
        <p class="job">Could not load new translation jobs!</p>
      {:else if noJobAvailable}
        <p class="job">There are no jobs available for now, come back later!</p>
      {:else}
        <p class="job">Loading jobs...</p>
      {/if}
    {/each}
  </div>
</main>
