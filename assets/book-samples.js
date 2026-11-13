"use strict";

const byId = id => document.getElementById(id);
const search = byId("search");
const category = byId("category");
const status = byId("status");
const samples = byId("samples");
const pagination = byId("pagination");
const params = new URLSearchParams(location.search);
const selectedId = params.get("book");
const pageSize = 18;
const normalize = value => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
let catalogue = [];
let page = 1;

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Sample data unavailable");
  return response.json();
}

function renderShelf() {
  const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  const filtered = catalogue.filter(book =>
    (!category.value || book.category === category.value) &&
    words.every(word => book.searchText.includes(word))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  page = Math.min(page, pages);
  const start = (page - 1) * pageSize;
  status.textContent = filtered.length
    ? `${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length} samples`
    : "No samples match your search.";
  const cards = filtered.slice(start, start + pageSize).map(book => {
    const card = document.createElement("article");
    card.className = "card";
    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.textContent = book.title;
    link.href = book.href;
    heading.append(link);
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${book.author} · ${book.category}`;
    card.append(heading, meta);
    return card;
  });
  samples.replaceChildren(...cards);
  pagination.hidden = pages === 1;
  byId("page").textContent = `Page ${page} of ${pages}`;
  byId("previous").disabled = page === 1;
  byId("next").disabled = page === pages;
}

async function start() {
  const rows = await loadJson("book-samples-index.json");
  catalogue = [
    {id: null, title: "The Absent Father Effect on Daughters", author: "Susan E. Schwartz",
      category: "Other", href: "the-absent-father-effect-on-daughters.html"},
    ...rows.map(([id, title, author, category, shard]) =>
      ({id, title, author, category, shard, href: `?book=${id}`}))
  ].map(book => ({...book, searchText: normalize(`${book.title} ${book.author}`)}));
  for (const name of [...new Set(catalogue.map(book => book.category))].sort()) {
    category.add(new Option(name, name));
  }
  renderShelf();
  if (selectedId === null) return;
  const book = catalogue.find(item => String(item.id) === selectedId && item.id !== null);
  if (!book) {
    status.textContent = "This sample could not be found. Browse the collection below.";
    return;
  }
  try {
    const excerpts = await loadJson(`book-excerpts-${book.shard}.json`);
    const paragraphs = excerpts[book.id];
    if (!Array.isArray(paragraphs) || !paragraphs.length) throw new Error("Missing excerpt");
    byId("title").textContent = book.title;
    byId("byline").textContent = `${book.author} · ${book.category} · English excerpt`;
    byId("excerpt").replaceChildren(...paragraphs.map(text => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }));
    byId("full-book").href = `https://www.gutenberg.org/ebooks/${book.id}`;
    document.title = `${book.title} | ReadMalawi`;
    byId("shelf").hidden = true;
    byId("reader").hidden = false;
  } catch {
    status.textContent = "The excerpt is temporarily unavailable. Browse the collection below.";
  }
}

search.addEventListener("input", () => { page = 1; renderShelf(); });
category.addEventListener("change", () => { page = 1; renderShelf(); });
byId("previous").addEventListener("click", () => { page--; renderShelf(); status.scrollIntoView(); });
byId("next").addEventListener("click", () => { page++; renderShelf(); status.scrollIntoView(); });
start().catch(() => { status.textContent = "The collection could not load. Refresh to try again."; });
