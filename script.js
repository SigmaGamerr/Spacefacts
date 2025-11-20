// Backend API hosted on Render
const apiBase = "https://spacefacts.onrender.com/api/search";

function renderResults(items) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!items || items.length === 0) {
    results.innerHTML = `<div class="meta">No results found.</div>`;
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML = `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
      ${item.snippet ? `<div class="snippet">${item.snippet}</div>` : ""}
    `;
    results.appendChild(div);
  });
}

async function search() {
  const q = document.getElementById("q").value.trim();
  const status = document.getElementById("status");
  const error = document.getElementById("error");
  const btn = document.getElementById("go");

  error.textContent = "";
  if (!q) return;

  btn.disabled = true;
  status.textContent = "Searching...";

  try {
    const res = await fetch(`${apiBase}?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const { results = [], query = q, provider = "" } = data;

    renderResults(results);
    status.textContent = `Showing ${results.length} results for "${query}" via ${provider}`;
    document.getElementById("provider").textContent = provider ? `Provider: ${provider}` : "";
  } catch (e) {
    console.error(e);
    status.textContent = "";
    error.textContent = "Search failed. Please try again.";
  } finally {
    btn.disabled = false;
  }
}

document.getElementById("go").addEventListener("click", search);
document.getElementById("q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") search();
});

// Backend health check
(async function pingBackend() {
  try {
    const res = await fetch(`${apiBase}?q=ping`);
    if (res.ok) {
      document.getElementById("backendLink").textContent = "Backend online";
    } else {
      document.getElementById("backendLink").textContent = "Backend unreachable";
    }
  } catch {
    document.getElementById("backendLink").textContent = "Backend unreachable";
  }
})();

