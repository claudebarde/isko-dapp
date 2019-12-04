import { writable } from "svelte/store";

const defaultStore = {
  isUserConnected: undefined,
  balance: undefined,
  accountType: undefined,
  info: undefined
  // TODO: INFO MUST BE SET TO UNDEFINED FOR PRODUCTION
  /*info: {
    creation: 1575209147646,
    firstname: "Claude",
    lastTranslation: 0,
    lastname: "Barde",
    numberOfTranslations: 0,
    signupTxHash:
      "0x01433d8aa5bcd7d96b20c009e35c42cec0210f7ddd41d160ee7364927bb6d44f",
    withdrawals: [],
    feedbacks: [],
    languagePairs: [],
    uid: "0x8cf5ecb5d4cbc8c9fb81fc5c55353e2918070053"
  }*/
};

const store = () => {
  const { subscribe, set, update } = writable(defaultStore);

  return {
    subscribe,
    updateBalance: newBalance => {
      update(currentStore => ({ ...currentStore, balance: newBalance }));
    },
    connectedUser: status => {
      update(currentStore => ({ ...currentStore, isUserConnected: status }));
    },
    updateAccountType: accountType => {
      update(currentStore => ({ ...currentStore, accountType }));
    },
    updateAccountInfo: info => {
      update(currentStore => ({ ...currentStore, info }));
    },
    reset: () => set(defaultStore)
  };
};

export default store();
