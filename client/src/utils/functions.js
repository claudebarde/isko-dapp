import { validMIMEtypes } from "./utils";

export const shortenHash = hash =>
  !!hash ? hash.slice(0, 7) + "..." + hash.slice(-4) : "";

export const upperFirst = word => word[0].toUpperCase() + word.slice(1);

export const fromWeiToEther = (web3, wei) => {
  if (!!wei) {
    return (
      Math.round(web3.utils.fromWei(wei.toString(), "ether") * 10000) / 10000
    );
  } else {
    return 0;
  }
};

export const checkJobPriority = ({ duedate, timestamp }) => {
  const timeLeft = parseInt(timestamp) + parseInt(duedate * 1000) - Date.now();
  //console.log(timeLeft, id);
  if (timeLeft <= 18000) {
    // less than 5 hours or expired
    return "high-priority-job";
  } else if (timeLeft > 18000 && timeLeft < 172800000) {
    // between 5 hours and 48 hours
    return "medium-priority-job";
  } else {
    return "low-priority-job";
  }
};

export const convertJobStatus = statusNumber => {
  switch (parseInt(statusNumber)) {
    case 0:
      return "available";
    case 1:
      return "accepted";
    case 2:
      return "delivered";
    case 3:
      return "review";
    case 4:
      return "paidout";
    case 5:
      return "cancelled";
    default:
      return null;
  }
};

export const validateFile = file => {
  //const file = event.target.files[0];
  let selectedFile = {
    size: undefined,
    type: undefined,
    name: "Choose a file"
  };
  let textInput = "";
  let result = { error: true };
  if (file && file.size / 1024 / 1024 <= 1) {
    if (validMIMEtypes.includes(file.type)) {
      // not more than 1 MB
      const fileSize = file.size; // in bytes
      const fileType = file.type;
      let chosenFileName = file.name;
      if (chosenFileName.length >= 20) {
        const arr = file.name.split(".");
        const extension = arr[arr.length - 1];
        chosenFileName = chosenFileName.slice(0, 15) + "(...)." + extension;
      }

      selectedFile = {
        size: fileSize,
        type: fileType,
        name: chosenFileName,
        file
      };
      const reader = new FileReader();
      // file reading finished successfully
      reader.addEventListener("load", event => {
        const text = event.target.result;
        // contents of the file
        //console.log(text);
        textInput = text;
      });
      // read as text file
      reader.readAsText(file);

      result = { ...result, error: false, selectedFile, textInput };
    } else {
      result = { ...result, msg: "Unsupported file type" };
    }
  } else {
    result = { ...result, msg: "File is over 1 MB" };
  }

  return result;
};
