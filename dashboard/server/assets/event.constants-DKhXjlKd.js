const TOP_PAGES_SORT_COLUMNS = [
  "sessions",
  "pageviews",
  "bounce_rate",
  "avg_duration"
];
const BOT_GROUP_LABELS = {
  answers: "AI answers",
  indexing: "AI search indexing",
  training: "AI training",
  search: "Search engines",
  other: "Other"
};
const AI_BOT_GROUPS = [
  "answers",
  "indexing",
  "training"
];
const BOT_CATEGORY_GROUP = {
  "AI Assistant": "answers",
  "AI Agent": "answers",
  "AI Search Crawler": "indexing",
  "AI Data Scraper": "training",
  "Search bot": "search"
};
const BOT_NAME_GROUP = {
  // Meta: the agent crawls for training and indexing, the fetcher runs on a
  // user's request.
  "Meta-ExternalAgent": "training",
  "Meta-ExternalFetcher": "answers",
  // ByteDance's and Common Crawl's crawls are the usual training corpora.
  Bytespider: "training",
  "ccBot crawler": "training",
  // Amazon searches with Amzn-SearchBot; Amazonbot may train its models.
  Amazonbot: "training",
  // Builds Vertex AI agents' search index on the site owner's request.
  "Google-CloudVertexBot": "indexing",
  "Applebot-Extended": "training"
};
function botGroup(name, category) {
  return BOT_NAME_GROUP[name] ?? BOT_CATEGORY_GROUP[category] ?? "other";
}
function isAiBotGroup(group) {
  return AI_BOT_GROUPS.includes(group);
}
export {
  BOT_GROUP_LABELS as B,
  TOP_PAGES_SORT_COLUMNS as T,
  botGroup as b,
  isAiBotGroup as i
};
//# sourceMappingURL=event.constants-DKhXjlKd.js.map
