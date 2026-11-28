import { B as createServerRpc, A as createServerFn } from "./worker-entry-C5kSRogq.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
const getServerEnvs_createServerFn_handler = createServerRpc("f93d07d12531485875552f15e066319e50b573dc3cd8f9198fa17bf0f434b125", (opts, signal) => {
  return getServerEnvs.__executeServer(opts, signal);
});
const getServerEnvs = createServerFn().handler(getServerEnvs_createServerFn_handler, () => {
  const envs = {
    apiUrl: String(process.env.API_URL),
    dashboardUrl: String(process.env.DASHBOARD_URL),
    isSelfHosted: process.env.SELF_HOSTED !== void 0,
    isMaintenance: process.env.MAINTENANCE === "1",
    isDemo: process.env.DEMO_USER_ID !== void 0
  };
  return envs;
});
export {
  getServerEnvs_createServerFn_handler
};
//# sourceMappingURL=get-envs-EdGAx4FM.js.map
