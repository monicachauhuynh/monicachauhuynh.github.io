/* checking mercury retrograde */
const TZ = "Asia/Ho_Chi_Minh";
const RETROGRADES = [
  ["2026-02-26T06:48Z", "2026-03-20T19:33Z"],
  ["2026-06-29T17:35Z", "2026-07-23T22:59Z"],
  ["2026-10-24T07:13Z", "2026-11-13T15:55Z"],
  ["2027-02-09T17:37Z", "2027-03-03T12:33Z"],
  ["2027-06-10T18:15Z", "2027-07-04T19:41Z"],
  ["2027-10-07T14:37Z", "2027-10-28T14:11Z"],
].map(([start, end]) => [Date.parse(start), Date.parse(end)]);
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const prettyDate = (ms) =>
  new Date(ms)
    .toLocaleDateString("en-US", { timeZone: TZ, month: "long", day: "numeric", year: "numeric" })
    .toLowerCase()

function countdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
}

function mercury(now = Date.now()) {
  const current = RETROGRADES.find(([start, end]) => now >= start && now < end);
  const next = RETROGRADES.find(([start]) => start > now);
  return {
    retro: Boolean(current),
    current,
    next,
    msLeft: current ? current[1] - now : null,
    msUntilNext: next ? next[0] - now : null,
  };
}

function showMercury() {
  const m = mercury();
  const out = document.getElementById("mercury-status");

  if (m.retro) {
    out.textContent = `until ${prettyDate(m.current[1])} (${countdown(m.msLeft)} left)`;
  } else if (m.next) {
    out.textContent = `in ${countdown(m.msUntilNext)}`;
  } else {
    out.textContent = "no data of the next retrograde";
  }
}

/* timezone */
function showSaigon() {
  const time = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).toLowerCase();

  document.getElementById("saigon").textContent = `sài gòn, ${time}`;
}

/* journal listing */
const container = document.getElementById("journal");
const entries = [...journal].sort((a, b) => b.date.localeCompare(a.date));
entries.forEach((entry) => {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const time = document.createElement("time");
  time.dateTime = entry.date;
  time.className = "muted";
  time.textContent = entry.date.replaceAll("-", " · ");
  summary.append(time, " " + entry.title);
  details.append(summary);
  entry.body.split("\n\n").forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    details.append(p);
  });
  container.append(details);
});

/* reference text */
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
const nodes = [];
while (walker.nextNode()) nodes.push(walker.currentNode);


/* spotify currently listening */

const SPOTIFY_WORKER =
  "https://spotify.monicachauhuynh.workers.dev";

async function showSpotify() {
  const out = document.getElementById("spotify-status");

  if (!out) return;

  try {
    const res = await fetch(`${SPOTIFY_WORKER}/now`);
    const data = await res.json();

    out.replaceChildren();

    if (data.error) {
      out.textContent = "spotify not connected. ";

      const link = document.createElement("a");
      link.href = `${SPOTIFY_WORKER}/login`;
      link.textContent = "connect spotify ↗";

      out.append(link);
      return;
    }

    if (!data.title) {
      out.textContent = "nothing is playing right now";
      return;
    }

    out.append(
      document.createTextNode(
        `${data.is_playing ? "listening to " : "paused: "}`
      )
    );

    const link = document.createElement("a");
    link.href = data.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = data.title;

    out.append(link);

    out.append(
      document.createTextNode(` by ${data.artist}`)
    );

    if (!data.is_playing) {
      out.append(document.createTextNode(" (paused)"));
    }

  } catch (error) {
    console.error("Spotify request failed:", error);

    out.textContent = "spotify is taking a little break";
  }
}

// Initial request
showSpotify();

// Refresh every 30 seconds
setInterval(showSpotify, 30000);


/* on page load */
showMercury();
setInterval(showMercury, 1000);   
showSaigon();                    
setInterval(showSaigon, 1000);   
nodes.forEach((node) => {
  node.textContent = node.textContent.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (match, key) => content[key] ?? match
  );
});

/* tarot reading 
let tarotLoading = false;
async function loadTarot() {
  if (tarotLoading) return; // ignore re-opens while a pull is in progress
  tarotLoading = true;
  const out = document.getElementById("tarot-result");
  const meaningEl = document.getElementById("tarot-meaning");
  out.textContent = "⟢ shuffling the cards…";
  try {
    const res = await fetch("https://tarotapi.dev/api/v1/cards/random?n=1");
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const card = data.cards[0];
    const reversed = Math.random() < 0.5;
    out.textContent = reversed ? `⟢ you pulled ${card.name} (reversed) for today.` : `⟢ you pulled ${card.name} for today.`;
    meaningEl.textContent = reversed ? card.meaning_rev : card.meaning_up;
  } catch (err) {
    console.warn("tarot api failed:", err);
    out.textContent = "the cards are quiet right now. ask again later.";
  } finally {
    tarotLoading = false;
  }
}
const tarotBox = document.getElementById("tarot");
tarotBox.addEventListener("toggle", () => {
  if (tarotBox.open) loadTarot();   // runs on every open
});*/