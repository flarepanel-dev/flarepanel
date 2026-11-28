import { i7 as zChartEvent } from "./router-gBnYxPzA.js";
import { o as object, i as boolean, h as array, s as string, l as literal, j as _null, d as _enum, g as discriminatedUnion } from "./pick-CfnSzKDx.js";
const zProjectType = _enum(["website", "app", "backend"]);
object({
  name: string().min(1),
  domain: string().url().or(literal("")).or(_null()).optional(),
  cors: array(string()).default([]),
  crossDomain: boolean().optional().default(false),
  types: array(zProjectType).optional().default([])
});
object({
  name: string().min(1).optional(),
  domain: string().url().or(literal("")).or(_null()).optional(),
  cors: array(string()).optional(),
  crossDomain: boolean().optional(),
  allowUnsafeRevenueTracking: boolean().optional(),
  aiStoreContent: boolean().optional()
});
const zProjectFilterIp = object({
  type: literal("ip"),
  ip: string()
});
const zProjectFilterProfileId = object({
  type: literal("profile_id"),
  profileId: string()
});
const zProjectFilterEvent = zChartEvent.extend({
  type: literal("event")
});
const zProjectFilters = discriminatedUnion("type", [
  zProjectFilterIp,
  zProjectFilterProfileId,
  zProjectFilterEvent
]);
const zProject = object({
  id: string(),
  name: string().min(1),
  filters: array(zProjectFilters).default([]),
  domain: string().url().or(literal("").or(_null())),
  cors: array(string()).default([]),
  crossDomain: boolean().default(false),
  allowUnsafeRevenueTracking: boolean().default(false),
  aiStoreContent: boolean().default(true)
});
object({
  id: string(),
  name: string().min(1).optional(),
  filters: array(zProjectFilters).optional(),
  domain: string().url().or(literal("").or(_null())).optional(),
  cors: array(string()).optional(),
  crossDomain: boolean().optional(),
  allowUnsafeRevenueTracking: boolean().optional(),
  aiStoreContent: boolean().optional()
});
export {
  zProject as a,
  zProjectFilterEvent as z
};
//# sourceMappingURL=project.constants-BD1UHdjH.js.map
