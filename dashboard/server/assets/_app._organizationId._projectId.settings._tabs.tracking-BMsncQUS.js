import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { e as useAppParams, a as useTRPC, I as useAppContext, j as useQuery, dR as Combobox } from "./router-gBnYxPzA.js";
import { I as InstallGuide } from "./install-guide-8ROrm6uK.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./syntax-CwZKbcAR.js";
import "./funnel-tracking-CMJu0A5n.js";
function Component() {
  const {
    projectId
  } = useAppParams();
  const trpc = useTRPC();
  const {
    apiUrl,
    isSelfHosted
  } = useAppContext();
  const {
    data: project
  } = useQuery(trpc.project.getProjectWithClients.queryOptions({
    projectId
  }));
  const [selectedClientId, setSelectedClientId] = reactExports.useState(null);
  const clients = (project?.clients ?? []).filter((candidate) => candidate.type !== "read");
  const client = clients.find((candidate) => candidate.id === selectedClientId) ?? clients[0];
  if (!(project && client)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-6", children: [
    clients.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Combobox, { items: clients.map((candidate) => ({
      value: candidate.id,
      label: candidate.name
    })), onChange: setSelectedClientId, placeholder: "Select client", searchable: true, value: client.id }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InstallGuide, { context: {
      clientId: client.id,
      // Secrets are stored hashed; after creation only the snippet
      // placeholder remains.
      clientSecret: null,
      apiUrl: isSelfHosted ? apiUrl : null
    }, defaultMethod: "manual", projectId: project.id, projectName: project.name, projectTypes: project.types })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.tracking-BMsncQUS.js.map
