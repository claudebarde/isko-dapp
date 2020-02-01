<script>
  import moment from "moment";
  import { shortenHash, fromWeiToEther } from "../../../utils/functions";

  export let txHash;
  export let amount;
  export let timestamp;
  export let web3;
</script>

<style>
  .grid {
    display: grid;
    grid-template-columns: 40% 30% 30%;
    grid-template-rows: repeat(auto-fill, 25%);
    align-items: center;
    margin: 10px;
  }

  .price {
    text-align: center;
  }

  .date {
    font-size: 0.75rem;
    color: #a0aec0;
    text-align: right;
  }
</style>

<div class="grid">
  <div>
    <strong>{shortenHash(txHash)}</strong>
    <a
      href={`https://etherscan.io/address/${txHash}`}
      target="_blank"
      rel="noopener noreferrer">
      <img
        src="images/external-link.svg"
        alt="external-link"
        class="external-link" />
    </a>
  </div>
  <div class="price">Ξ{fromWeiToEther(web3, amount)}</div>
  <div class="date">{moment(timestamp).format('MM/DD/YYYY')}</div>
</div>
