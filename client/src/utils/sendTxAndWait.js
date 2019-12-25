let subscription = undefined;
let txHash = 0;
let result = "";
let errorMsg;

const sendTxAndWait = ({
  web3,
  contractInstance,
  currentAddress,
  contractAddress,
  value = 0
}) => {
  // prepares transaction parameters
  let tx_builder = contractInstance.methods.addNewTranslator();
  let encoded_tx = tx_builder.encodeABI();
  let txObject = [
    {
      data: encoded_tx,
      from: currentAddress.toLowerCase(),
      to: contractAddress,
      value
    }
  ];
  // subscribes to new block creation to confirm account creation
  subscription = web3.eth
    .subscribe("newBlockHeaders", (error, result) => {
      if (!error) {
        console.log(result);
        errorMsg = error;
        result = "subscription_failed";

        return;
      }

      console.error(error);
    })
    .on("connected", subscriptionId => {
      // once connected, sends transaction to contract
      try {
        ethereum.sendAsync(
          {
            method: "eth_sendTransaction",
            params: txObject,
            from: currentAddress.toLowerCase()
          },
          (err, receipt) => {
            if (err) {
              console.log(err);
              errorMsg = err;
              result = "sendTransaction_failed";

              return;
            }

            if (receipt.result) {
              txHash = receipt.result;
            } else {
              result = "sendTransaction_no_receipt";

              return;
            }
          }
        );
      } catch (error) {
        console.log(error);
        errorMsg = error;
        result = "sendTransaction_failed_catch";

        return;
      }
    })
    .on("data", async blockHeader => {
      const blockHash = blockHeader.hash;
      try {
        // fetches block
        const block = await web3.eth.getBlock(blockHash);
        // gets the transactions from block
        const { transactions } = block;
        if (transactions.includes(txHash)) {
          return;
        }
      } catch (error) {
        errorMsg = error;
        result = "getBlock_error";
      }
    })
    .on("error", err => {
      errorMsg = err;
      result = "subscription_error";
      return;
    });

  // unsubscribes the subscription
  subscription.unsubscribe(function(error, success) {
    if (success) {
      console.log("Successfully unsubscribed!");
    }
  });

  return { result, txHash };
};

export default sendTxAndWait;
