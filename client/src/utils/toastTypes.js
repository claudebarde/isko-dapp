const toastTypes = {
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
  }
};

export default toastTypes;
