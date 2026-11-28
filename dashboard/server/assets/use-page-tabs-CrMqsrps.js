import { a2 as useLocation } from "./router-gBnYxPzA.js";
function usePageTabs(tabs) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const tab = segments[segments.length - 1];
  if (!tab) {
    return {
      activeTab: tabs[0].id,
      tabs
    };
  }
  const match = tabs.find((t) => t.id === tab);
  if (!match) {
    return {
      activeTab: tabs[0].id,
      tabs
    };
  }
  return {
    activeTab: match.id,
    tabs
  };
}
export {
  usePageTabs as u
};
//# sourceMappingURL=use-page-tabs-CrMqsrps.js.map
