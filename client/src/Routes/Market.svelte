<script>
  import { fly } from "svelte/transition";
  import { onMount, afterUpdate } from "svelte";
  import firebase from "firebase";
  import moment from "moment";
  import langs from "langs";
  import { link } from "svelte-spa-router";
  import Navbar from "../Navbar/Navbar.svelte";
  import web3Store from "../stores/web3-store";
  import eventsStore from "../stores/events-store";
  import userStore from "../stores/user-store";
  import { shortenHash } from "../utils/functions";

  let availableJobs = [];
  let noJobAvailable = false;
  let loadingMarketError = false;
  let jobsFetched = false;
  let dataFromFirebase = [
    {
      id: "0x7272dd45949b64fcb07337d04c5d95dce5227a96e1e4509d61dd0c5227f3e280",
      contentType: "Generic Content",
      duedate: 172800,
      fromLang: "eng",
      jobType: "translation",
      price: 59220000000000000,
      supportType: "text",
      timestamp: 1576663581527,
      toLang: "fra",
      txHash:
        "0xaf1a64e8aeecae00fe40ec3ebb6dac82ea97d01093cfd9389b74e5ba1a647ac9"
    },
    {
      id: "0x07e65249e43d9b06d683e8ef565b700fb204e90bfcf2cab0fca9c2d6b5ff1a17",
      contentType: "Cryptocurrency",
      duedate: 345600,
      fromLang: "eng",
      jobType: "translation",
      price: 256230000000000000,
      supportType: "file",
      timestamp: 1576663662709,
      toLang: "fra",
      txHash:
        "0x17d18f368fbc40360114d8642c29285af6e40f58ca4c3560f30be74b1eaa94d1"
    },
    {
      id: "0x0b664cbe24333ce291993774cb83b9b25ca6edeea52c7e2565ea5660860926b8",
      contentType: "IT, Technical",
      duedate: 172800,
      fromLang: "eng",
      jobType: "translation",
      price: 46170000000000000,
      supportType: "text",
      timestamp: 1576674634705,
      toLang: "fra",
      txHash:
        "0x4d3dddf8e55d036ae17bf90be80d6936f74e6f9c98173fc2efeaa0e3939eb833"
    },
    {
      id: "0x34564cbe24333ce291993774cb83b9b25ca6edeea52c7e2565ea5660860926b8",
      contentType: "IT, Technical",
      duedate: 172800,
      fromLang: "eng",
      jobType: "translation",
      price: 46170000000000000,
      supportType: "text",
      timestamp: 1576674634705,
      toLang: "fra",
      txHash:
        "0x4d3dddf8e55d036ae17bf90be80d6936f74e6f9c98173fc2efeaa0e3939eb833"
    },
    {
      id: "0x78964cbe24333ce291993774cb83b9b25ca6edeea52c7e2565ea5660860926b8",
      contentType: "IT, Technical",
      duedate: 172800,
      fromLang: "spa",
      jobType: "translation",
      price: 46170000000000000,
      supportType: "text",
      timestamp: 1576674634705,
      toLang: "fra",
      txHash:
        "0x4d3dddf8e55d036ae17bf90be80d6936f74e6f9c98173fc2efeaa0e3939eb833"
    }
  ];

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

  afterUpdate(async () => {
    if ($userStore.accountType && $userStore.info && !jobsFetched) {
      // import jobs
      /*try {
        const db = firebase.firestore();
        let snapShot;
        if ($userStore.accountType === "translator") {
          snapShot = await db
            .collection("jobMarket")
            .where("fromLang", "==", $userStore.info.languagePairs[0].from)
            .where("toLang", "==", $userStore.info.languagePairs[0].to)
            .orderBy("timestamp")
            .get();
        } else {
          snapShot = await db
            .collection("jobMarket")
            .orderBy("timestamp")
            .get();
        }
        if (snapShot.docs.length === 0) noJobAvailable = true;
        snapShot.forEach(
          doc =>
            (availableJobs = [...availableJobs, { id: doc.id, ...doc.data() }])
        );
        console.log(JSON.stringify(availableJobs));
      } catch (err) {
        console.log(err);
        loadingMarketError = true;
        eventsStore.toggleWarningModal(
          "An error has occurred while downloading the new jobs!"
        );
        return;
      }*/
      setTimeout(() => {
        availableJobs = dataFromFirebase.filter(
          doc =>
            doc.fromLang === $userStore.info.languagePairs[0].from &&
            doc.toLang === $userStore.info.languagePairs[0].to
        );
      }, 1000);
      jobsFetched = true;
    }
  });

  onMount(async () => {});
</script>

<style>
  h1,
  h3 {
    text-align: center;
  }

  .job {
    display: flex;
    flex-direction: row;
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

  .new-transl {
    justify-content: center !important;
  }

  .new-transl a {
    text-decoration: none;
    font-weight: bold;
  }

  .open-tx-hash {
    text-decoration: none;
    color: inherit;
  }

  .claim-job {
    color: #48bb78;
    font-weight: bold;
    cursor: pointer;
  }

  @media (max-width: 1024px) {
    .job {
      width: 95%;
    }
  }
</style>

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
            <p class="claim-job">Claim</p>
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
          <p>
            Ξ {Math.round($web3Store.web3.utils.fromWei(job.price.toString(), 'ether') * 10000) / 10000}
          </p>
          <p class="duedate">
            Due {moment(parseInt(job.timestamp) + parseInt(job.duedate * 1000)).fromNow()}
          </p>
        </div>
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
