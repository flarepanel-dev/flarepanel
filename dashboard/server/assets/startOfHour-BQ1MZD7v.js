import { bL as toDate, cp as constructFrom, e0 as millisecondsInHour } from "./router-gBnYxPzA.js";
function addMilliseconds(date, amount) {
  const timestamp = +toDate(date);
  return constructFrom(date, timestamp + amount);
}
function addHours(date, amount) {
  return addMilliseconds(date, amount * millisecondsInHour);
}
function startOfHour(date) {
  const _date = toDate(date);
  _date.setMinutes(0, 0, 0);
  return _date;
}
export {
  addHours as a,
  startOfHour as s
};
//# sourceMappingURL=startOfHour-BQ1MZD7v.js.map
