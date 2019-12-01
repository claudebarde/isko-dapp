import { writable } from "svelte/store";

const store = () => {
  const { subscribe, set, update } = writable({
    isUserConnected: undefined,
    balance: undefined
  });

  return {
    subscribe,
    updateBalance: newBalance => {
      update(currentStore => ({ ...currentStore, balance: newBalance }));
    },
    connectedUser: status => {
      update(currentStore => ({ ...currentStore, isUserConnected: status }));
    }
  };
};

export default store();
