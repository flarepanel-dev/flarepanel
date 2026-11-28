import { bk as useQueryStates, bl as parseAsString, bm as parseAsIsoDateTime } from "./router-gBnYxPzA.js";
import { a as reactExports } from "./worker-entry-C5kSRogq.js";
const parsers = {
  event: parseAsString,
  eventAt: parseAsIsoDateTime,
  chat: parseAsString
};
function useEventDrawer() {
  const [state, setState] = useQueryStates(parsers, { history: "push" });
  const openEvent = reactExports.useCallback(
    ({ id, createdAt }) => setState({
      event: id,
      eventAt: createdAt ? new Date(createdAt) : null,
      chat: null
    }),
    [setState]
  );
  const closeEvent = reactExports.useCallback(
    (options) => setState({ event: null, eventAt: null }, options),
    [setState]
  );
  return {
    eventId: state.event,
    createdAt: state.eventAt ?? void 0,
    chatId: state.chat,
    isOpen: state.event !== null,
    openEvent,
    closeEvent
  };
}
export {
  useEventDrawer as u
};
//# sourceMappingURL=use-event-drawer-DCAhkqzM.js.map
