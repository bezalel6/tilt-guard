const container = document.querySelector("#container");
container.style.display = "none";

const userElement = document.querySelector("#user");
const cooldownElement = document.querySelector("#cooldown");
const cooldownOutElement = document.querySelector("#cooldown-out");
const startAtLossesOutElement = document.querySelector("#losses-out");
const startAtLossesElement = document.querySelector("#start_at_losses");

function bindValue(range, out) {
  out.innerText = range.value;
  range.oninput = () => {
    out.innerText = range.value;
  };
}

const key = "tilt-mins";
const loadData = async () => {
  const getStorageData = (key) =>
    new Promise((resolve, reject) =>
      chrome.storage.sync.get(key, (result) =>
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve(result)
      )
    );

  const { data } = await getStorageData("data");
  if (data) setState(data);
  else console.log("no data");
  bindValue(cooldownElement, cooldownOutElement);
  bindValue(startAtLossesElement, startAtLossesOutElement);
  // console.log("%cpopup.js line:36 data", "color: #007acc;", data);

  container.style.display = "inherit";
};
const setState = ({ cooldown, startAtLosses, user }) => {
  cooldownElement.value = cooldown;
  startAtLossesElement.value = startAtLosses;
  userElement.value = user;
  console.log(cooldown, startAtLosses);
};
const currentState = () => {
  return {
    cooldown: cooldownElement.value,
    startAtLosses: startAtLossesElement.value,
    user: userElement.value,
  };
};
const setStorageData = (data) =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  );
const saveBtn = document.querySelector("#save");
saveBtn.onclick = () => {
  setStorageData({ data: currentState() }).then(() => {
    console.log("saved");
    // send message to content-script.js
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { logme: "saved" });
    });
    // check mark emoji
    saveBtn.innerText = "✅";
    // disable range element
    cooldownElement.disabled = true;
    startAtLossesElement.disabled = true;
    saveBtn.onclick = () => window.close();
  });
};
console.log("off the top of my head");
loadData();
