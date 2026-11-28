import { bL as toDate, cp as constructFrom } from "./router-gBnYxPzA.js";
function addDays(date, amount) {
  const _date = toDate(date);
  if (isNaN(amount)) return constructFrom(date, NaN);
  if (!amount) {
    return _date;
  }
  _date.setDate(_date.getDate() + amount);
  return _date;
}
export {
  addDays as a
};
//# sourceMappingURL=addDays-BIiJOlUZ.js.map
