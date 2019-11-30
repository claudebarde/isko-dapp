import { writable } from "svelte/store";

const store = () => {
  const { subscribe, set, update } = writable({
    hasMetamask: undefined,
    isMetamaskConnected: false,
    currentAddress: undefined,
    web3: undefined,
    contractAddress: "0xbAfC07dc962e51C75D7EBA9843b7CB35B37F2520",
    contractInstance: undefined
  });

  return {
    subscribe,
    hasMetamask: newState => {
      update(currentStore => ({ ...currentStore, hasMetamask: newState }));
    },
    isMetamaskConnected: newState =>
      update(currentStore => ({
        ...currentStore,
        isMetamaskConnected: newState
      })),
    setCurrentAddress: newAddress =>
      update(currentStore => ({
        ...currentStore,
        currentAddress: newAddress
      })),
    setWeb3: instance =>
      update(currentStore => ({
        ...currentStore,
        web3: instance
      })),
    setContractInstance: instance =>
      update(currentStore => ({
        ...currentStore,
        contractInstance: instance
      }))
  };
};

export default store();
