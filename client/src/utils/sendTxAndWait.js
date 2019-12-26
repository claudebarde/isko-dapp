let subscription = undefined;
let txHash = 0;
let result = "";
let errorMsg;

const unsubscribe = () => {
  // unsubscribes the subscription
  subscription.unsubscribe(function(error, success) {
    if (success) {
      console.log("Successfully unsubscribed!");
    }
  });
};

const sendTxAndWait = ({
  web3,
  contractInstance,
  currentAddress,
  contractAddress,
  value = 0,
  method,
  methodParameters = null
}) =>
  new Promise((resolve, reject) => {
    // prepares transaction parameters
    let tx_builder;
    if (methodParameters === null) {
      tx_builder = contractInstance.methods[method]();
    } else {
      tx_builder = contractInstance.methods[method](methodParameters);
    }
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
        if (error) {
          console.error(error);
          unsubscribe();
          reject({
            result: "subscription_failed",
            errorMsg: error.message ? error.message : error,
            txHash
          });
        }
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
            (error, receipt) => {
              if (error) {
                console.log(error);
                unsubscribe();
                reject({
                  result: "sendTransaction_failed",
                  errorMsg: error.message ? error.message : error,
                  txHash
                });
              }

              if (receipt.result) {
                txHash = receipt.result;
              } else {
                unsubscribe();
                reject({
                  result: "sendTransaction_no_receipt",
                  errorMsg: error.message ? error.message : error,
                  txHash
                });
              }
            }
          );
        } catch (error) {
          console.log(error);
          unsubscribe();
          reject({
            result: "sendTransaction_failed_catch",
            errorMsg: error.message ? error.message : error,
            txHash
          });
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
            unsubscribe();
            resolve({ result: "tx_included", txHash });
          }
        } catch (error) {
          console.log(error);
          unsubscribe();
          reject({
            result: "getBlock_error",
            errorMsg: error.message ? error.message : error,
            txHash
          });
        }
      })
      .on("error", error => {
        console.log(error);
        unsubscribe();
        reject({
          result: "subscription_error",
          errorMsg: error.message ? error.message : error,
          txHash
        });
      });
  });

export default sendTxAndWait;
