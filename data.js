/* checking mercury retrograde */
const RETROGRADES = [
  ["2026-02-26", "2026-03-20"],
  ["2026-06-29", "2026-07-23"],
  ["2026-10-24", "2026-11-13"],
  ["2027-02-09", "2027-03-03"],
  ["2027-06-10", "2027-07-04"],
  ["2027-10-07", "2027-10-28"],
];
const today = () => new Date().toLocaleDateString("sv"); // local date, yyyy-mm-dd
function retroFromTable() {
  return RETROGRADES.some(([start, end]) => today() >= start && today() <= end);
}
async function loadMercury() {
  const out = document.getElementById("mercury-result");
  out.textContent = "಄ checking the sky…";
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
    ? "಄ mercury is in retrograde. watch your words, be gentle."
    : "಄ mercury is direct. communication is flowing as usual.";
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
  const out = document.getElementById("tarot-result");
  const meaningEl = document.getElementById("tarot-meaning");
  out.textContent = "⟢ shuffling the cards…";
  try {
    const res = await fetch("https://tarotapi.dev/api/v1/cards/random?n=1");
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const card = data.cards[0];
    const reversed = Math.random() < 0.5;
    out.textContent = reversed ? `⟢ you pulled the ${card.name} (reversed) for today.` : `⟢ you pulled the ${card.name} for today.`;
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