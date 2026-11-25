// Display names for search engines and AI assistants as the SEO page lists
// them (their canonical domains). Anything unknown falls back to the domain
// without its ending, capitalised: "bing.com" → "Bing".

const LABELS: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'claude.ai': 'Claude',
  'perplexity.ai': 'Perplexity',
  'gemini.google.com': 'Gemini',
  'copilot.com': 'Copilot',
  'grok.com': 'Grok',
  'mistral.ai': 'Mistral',
  'kagi.com': 'Kagi',
  'duckduckgo.com': 'DuckDuckGo',
  'search.brave.com': 'Brave Search',
  'ecosia.org': 'Ecosia',
  'yandex.com': 'Yandex',
  'baidu.com': 'Baidu',
  'naver.com': 'Naver',
};

export function sourceLabel(name: string): string {
  const known = LABELS[name.toLowerCase()];
  if (known) {
    return known;
  }
  const base = name.replace(/\..+$/, '');
  return base.charAt(0).toUpperCase() + base.slice(1);
}
