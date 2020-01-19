import { writable } from "svelte/store";

const store = () => {
  const { subscribe, set, update } = writable({
    hasMetamask: undefined,
    isMetamaskConnected: false,
    currentAddress: undefined,
    web3: undefined,
    contractAddress: "0x5Df4d75e02B581AC9ecb6c2dE33A0a215FF4e3aE",
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
        currentAddress:
          newAddress === undefined ? undefined : newAddress.toLowerCase()
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
