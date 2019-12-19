import { writable } from "svelte/store";

const defaultStore = {
  isUserConnected: undefined,
  balance: undefined,
  accountType: undefined,
  info: undefined
  //info: undefined
  // TODO: INFO MUST BE SET TO UNDEFINED FOR PRODUCTION
  /*info: {
    creation: 1575533331523,
    firstname: "Mia",
    jobs: [],
    lastJob: 0,
    lastname: "Banana",
    totalPaid: 0,
    uid: "0xfd09817ea0f037b7640a7d2abc1092fe8f8c71f9",
    email: "mia@test.com"
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
