console.log("im mr content look at me");

const formatParms = (...parms) => {
  return (
    (parms.length > 0 ? "?" : "") +
    parms.map((parm) => parm.key + "=" + parm.val).join("&")
  );
};

const Parm = (value, key) => {
  return { key: key, val: value };
};

let url = "https://lichess.org/api/games/user/";

const getStorageData = (key) =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, (result) =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  );

const getData = async () => {
  const { data } = await getStorageData("data");
  return data;
};

const TILT_URL = "https://tilted-haven.netlify.app/";

const options = {
  method: "GET",
  headers: {
    "Content-Type": "application/x-ndjson",
    Accept: "application/x-ndjson",
  },
  mode: "no-cors",
};
const start = async () => {
  let data = await getData();
  if (!data) {
    return;
  }
  let cooldown = Number(data.cooldown);
  let startAtLosses = Number(data.startAtLosses);
  console.log(cooldown, startAtLosses);
  if (cooldown == NaN || startAtLosses == NaN) return;
  const mins = cooldown;

  const since = Date.now() - 60 * 1000 * mins;
  // const softTilt = 4;
  // const hardTilt = 10;
  url += data.user;
  url = url + formatParms(Parm(since, "since"), Parm(startAtLosses, "max"));
  // console.log("%ccontent-script.js line:58 url", "color: #007acc;", url);
  fetch(url, options).then((res) => {
    res.text().then((text) => {
      if (!text) {
        return;
      }
      let games = text.split(/(?={"id")/gm);
      games = games.map(JSON.parse);
      let lost = 0;
      const g_val = 1;
      //   console.log("%ccontent-script.js line:23 games", "color: #007acc;", games);
      for (let game of games) {
        const wasWhite = game.players.white.user.name == data.user;
        let score = 0;
        if (game.winner == "white") {
          score = g_val * wasWhite ? 1 : -1;
        } else if (game.winner == "black") {
          score = g_val * wasWhite ? -1 : 1;
        }
        if (score == -1) {
          lost += score;
        } else if (score) break;
      }
      console.log("number lost ", lost);

      console.log("tilt item", localStorage.getItem("tilt"));
      lost *= -1;
      if (lost == startAtLosses) {
        const exp = Date.now() + cooldown * 60 * 1000;
        localStorage.setItem("expire", exp);
        location.replace(TILT_URL + "?lost=" + lost + "&cooldown=" + cooldown);
      } else {
        const exp = localStorage.getItem("expire");
        if (exp && Number(exp) > Date.now()) {
          location.replace(TILT_URL);
        }
      }
    });
  });
};
// listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse({});
  console.log("got msg");
  if (request.logme) {
    console.log(
      "%ccontent-script.js line:80 request",
      "color: #007acc;",
      request
    );
  }
  if (request.manualTrigger) {
    const exp = Date.now() + Number(request.manualTrigger) * 60 * 1000;
    localStorage.setItem("expire", exp);
    location.replace(TILT_URL + "?lost=" + lost + "&cooldown=" + cooldown);
  } else {
    start();
  }
});
// listen for messages from popup.js
start();
