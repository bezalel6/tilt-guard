// log completed web requests to lichess.org
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.endsWith("sides")) {
      setTimeout(() => {
        send();
      }, 1000);
    }
  },
  { urls: ["https://lichess.org/*/sides*"] }
);
function send() {
  getCurrentTab().then((tab) => {
    console.log("sending to tab ", tab);
    chrome.tabs.sendMessage(tab.id, { type: "tilt" }, function (response) {
      console.log(
        "%ccontent-script.js line:86 response",
        "color: #007acc;",
        response
      );
    });
  });
}
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
console.log("background");
