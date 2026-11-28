import { bL as toDate } from "./router-gBnYxPzA.js";
function endOfMonth(date) {
  const _date = toDate(date);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
export {
  endOfMonth as e
};
//# sourceMappingURL=endOfMonth-C3pRd8ne.js.map
