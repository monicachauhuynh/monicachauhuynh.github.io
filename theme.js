const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const prefersDark = matchMedia("(prefers-color-scheme: dark)");

function currentTheme() {
  return root.dataset.theme || (prefersDark.matches ? "dark" : "light");
}

function render() {
  const dark = currentTheme() === "dark";
  toggle.textContent = dark ? "☾" : "☀";   // shows what you'd switch to
  toggle.setAttribute("aria-label", dark ? "switch to light mode" : "switch to dark mode");
}

toggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
  render();
});

prefersDark.addEventListener("change", render);   // keep the label right if the device setting changes
render();