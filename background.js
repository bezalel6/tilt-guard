// log completed web requests to lichess.org
chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log(
      "%ccontent-script.js line:80 details",
      "color: #007acc;",
      details
    );
    if (details.url.endsWith("sides")) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "tilt" },
          function (response) {
            console.log(
              "%ccontent-script.js line:86 response",
              "color: #007acc;",
              response
            );
          }
        );
      });
    }
  },
  { urls: ["https://lichess.org/*"] }
);
