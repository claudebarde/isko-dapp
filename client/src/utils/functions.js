export const shortenHash = hash =>
  !!hash ? hash.slice(0, 7) + "..." + hash.slice(-4) : "";

export const upperFirst = word => word[0].toUpperCase() + word.slice(1);

export const fromWeiToEther = (web3, wei) =>
  Math.round(web3.utils.fromWei(wei.toString(), "ether") * 10000) / 10000;
