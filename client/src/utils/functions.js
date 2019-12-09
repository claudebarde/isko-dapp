export const shortenHash = hash =>
  !!hash ? hash.slice(0, 7) + "..." + hash.slice(-4) : "";
