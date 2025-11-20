import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

async function ddgSearch(q) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`;
  const res = await fetch(url);
  const data = await res.json();
  const items = [];
  (data.RelatedTopics || []).forEach(t => {
    const candidates = t.Topics || [t];
    candidates.forEach(x => {
      if (x.Text && x.FirstURL) {
        items.push({ title: x.Text, url: x.FirstURL, snippet: "", source: "DuckDuckGo" });
      }
    });
  });
  return items;
}

app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Missing query" });
  try {
    const results = await ddgSearch(q);
    res.json({ query: q, results: results.slice(0, 10), provider: "DuckDuckGo" });
  } catch {
    res.status(500).json({ error: "Search failed" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
