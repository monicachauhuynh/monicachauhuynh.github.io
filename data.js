/* retrograde */
const RETROGRADES = [
  ["2026-02-26", "2026-03-20"],
  ["2026-06-29", "2026-07-23"],
  ["2026-10-24", "2026-11-13"],
  ["2027-02-09", "2027-03-03"],
  ["2027-06-10", "2027-07-04"],
  ["2027-10-07", "2027-10-28"],
];

const today = () => new Date().toLocaleDateString("sv"); // local date, YYYY-MM-DD

function retroFromTable() {
  return RETROGRADES.some(([start, end]) => today() >= start && today() <= end);
}

async function loadMercury() {
  const out = document.getElementById("mercury-result");
  out.textContent = "checking the sky…";
  let retro;
  try {
    const res = await fetch("https://mercuryretrogradeapi.com/api?date=today");
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    console.log("mercury api:", data); // check the real shape here

    if (typeof data.is_retrograde === "boolean") retro = data.is_retrograde;
    else if (typeof data.phase === "string") retro = /retrograde/i.test(data.phase);
    else throw new Error("unexpected response");
  } catch (err) {
    console.warn("mercury api failed, using backup table:", err);
    retro = retroFromTable();
  }
  out.textContent = retro
    ? "yes. mercury is in retrograde. double-check your texts, back things up, be gentle."
    : "no. mercury is direct. communication is flowing as usual.";
}

const mercuryBox = document.getElementById("mercury");
mercuryBox.addEventListener("toggle", () => {
  if (mercuryBox.open && !mercuryBox.dataset.loaded) {
    mercuryBox.dataset.loaded = "1";   // only check once
    loadMercury();
  }
});

/* tarot reading */
let tarotLoading = false;
async function loadTarot() {
  if (tarotLoading) return; // ignore re-opens while a pull is in progress
  tarotLoading = true;
  const nameEl = document.getElementById("tarot-name");
  const meaningEl = document.getElementById("tarot-meaning");
  nameEl.textContent = "shuffling…";
  meaningEl.textContent = "";
  try {
    const res = await fetch("https://tarotapi.dev/api/v1/cards/random?n=1");
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const card = data.cards[0];
    const reversed = Math.random() < 0.5;

    nameEl.textContent = reversed ? `${card.name} (reversed)` : card.name;
    meaningEl.textContent = reversed ? card.meaning_rev : card.meaning_up;
  } catch (err) {
    console.warn("tarot api failed:", err);
    nameEl.textContent = "the cards are quiet right now.";
    meaningEl.textContent = "close and reopen to try again.";
  } finally {
    tarotLoading = false;
  }
}
const tarotBox = document.getElementById("tarot");
tarotBox.addEventListener("toggle", () => {
  if (tarotBox.open) loadTarot();   // runs on every open
});

/* phases of the moon */
const SUPERMOONS = ["2026-11-24", "2026-12-24"];

const MOON_EMOJI = {
  "new moon": "🌑", "waxing crescent": "🌒", "first quarter": "🌓",
  "waxing gibbous": "🌔", "full moon": "🌕", "waning gibbous": "🌖",
  "last quarter": "🌗", "waning crescent": "🌘",
};

// backup: works out the phase from the date, no network needed
function localMoon() {
  const synodic = 29.530588853;
  const knownNew = Date.UTC(2000, 0, 6, 18, 14);           // a known new moon
  const age = (((Date.now() - knownNew) / 86400000) % synodic + synodic) % synodic;
  const illum = Math.round(((1 - Math.cos((2 * Math.PI * age) / synodic)) / 2) * 100);
  const phases = [
    [1.84, "new moon"], [5.53, "waxing crescent"], [9.22, "first quarter"],
    [12.91, "waxing gibbous"], [16.61, "full moon"], [20.3, "waning gibbous"],
    [23.99, "last quarter"], [27.68, "waning crescent"], [30, "new moon"],
  ];
  const phase = phases.find(([limit]) => age < limit)[1];
  return { phase, illum };
}

async function loadMoon() {
  const out = document.getElementById("moon-result");
  out.textContent = "looking up…";

  let phase, illum;
  try {
    const offset = -new Date().getTimezoneOffset() / 60;    // visitor's utc offset
    const url = `https://aa.usno.navy.mil/api/rstt/oneday?date=${today()}&coords=10.8,106.7&tz=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    console.log("moon api:", data); // check the real shape here

    const d = data.properties.data;
    phase = d.curphase.toLowerCase();
    illum = d.fracillum ? parseInt(d.fracillum) : null;
  } catch (err) {
    console.warn("moon api failed, calculating locally:", err);
    ({ phase, illum } = localMoon());
  }

  const emoji = MOON_EMOJI[phase] ?? "☾";
  const isSuper = phase === "full moon" && SUPERMOONS.includes(today());
  out.textContent =
    `${emoji} ${isSuper ? "super " : ""}${phase}` +
    (illum != null ? ` · ${illum}% lit` : "");
}

const moonBox = document.getElementById("moon");
moonBox.addEventListener("toggle", () => {
  if (moonBox.open && !moonBox.dataset.loaded) {
    moonBox.dataset.loaded = "1"; // only look up once
    loadMoon();
  }
});

/* journal listing */
const container = document.getElementById("journal");
// newest first
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

nodes.forEach((node) => {
  node.textContent = node.textContent.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (match, key) => content[key] ?? match
  );
});