const properties = {
  has_profile: "Has a profile",
  name: "Name",
  path: "Path",
  origin: "Origin",
  referrer: "Referrer",
  referrer_name: "Referrer name",
  duration: "Duration",
  created_at: "Created at",
  country: "Country",
  city: "City",
  region: "Region",
  os: "OS",
  os_version: "OS version",
  browser: "Browser",
  browser_version: "Browser version",
  device: "Device",
  brand: "Brand",
  model: "Model"
};
function getPropertyLabel(property) {
  return properties[property] || property;
}
export {
  getPropertyLabel as g
};
//# sourceMappingURL=properties-B42zBES-.js.map
