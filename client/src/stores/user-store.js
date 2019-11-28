import { writable } from "svelte/store";

const store = () => {
  const { subscribe, set, update } = writable({
    balance: undefined
  });

  return {
    subscribe,
    updateBalance: newBalance => {
      update(currentStore => ({ ...currentStore, balance: newBalance }));
    }
  };
};

export default store();
