import { writable } from "svelte/store";

const store = () => {
  const { subscribe, set, update } = writable({
    toastOpen: false,
    toastTypes: {
      metamaskLoading: {
        title: "Loading...",
        text: "Checking your connection to MetaMask",
        type: "info",
        icon: "clock"
      },
      metamaskConnected: {
        title: "Connected to MetaMask",
        text: `You are now connected to MetaMask`,
        type: "success",
        icon: "thumbs-up"
      },
      metamaskDisconnected: {
        title: "Disconnected from MetaMask",
        text: `You have been disconnected from MetaMask, \nplease reconnect`,
        type: "warning",
        icon: "alert-triangle"
      },
      metamaskMainNetwork: {
        title: "Disconnected from main network",
        text: `You must be connected to Ethereum main network, \nplease reconnect`,
        type: "warning",
        icon: "alert-triangle"
      },
      pendingTx: {
        title: "Pending Transaction",
        text: `Waiting for transaction to be confirmed, please wait...`,
        type: "warning",
        icon: "alert-triangle"
      },
      confirmedContractRegistration: {
        title: "Confirmed Registration!",
        text: `You are now a registered translator, congratulations!`,
        type: "success",
        icon: "thumbs-up"
      }
    },
    toastType: "metamaskLoading",
    isWarningModalOpen: false,
    warningModalMessage: ""
  });

  return {
    subscribe,
    toggleToast: state => {
      update(currentStore => {
        if (state === false) return { ...currentStore, toastOpen: false };

        setTimeout(
          () => update(currentStore => ({ ...currentStore, toastOpen: false })),
          3000
        );
        return { ...currentStore, toastOpen: true };
      });
    },
    setToastType: newType => {
      update(currentStore => ({ ...currentStore, toastType: newType }));
    },
    toggleWarningModal: msg => {
      update(currentStore => ({
        ...currentStore,
        isWarningModalOpen: !currentStore.isWarningModalOpen,
        warningModalMessage: msg
      }));
    }
  };
};

export default store();
