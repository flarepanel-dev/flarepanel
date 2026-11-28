import { a as useTRPC, j as useQuery, aY as isOrganizationAdminRole } from "./router-gBnYxPzA.js";
function useOrganizationAccess(organizationId) {
  const trpc = useTRPC();
  const { data } = useQuery({
    ...trpc.organization.myAccess.queryOptions({
      organizationId: organizationId ?? ""
    }),
    enabled: !!organizationId
  });
  return {
    role: data?.role ?? null,
    isAdmin: !!data && isOrganizationAdminRole(data.role)
  };
}
export {
  useOrganizationAccess as u
};
//# sourceMappingURL=use-organization-access-Bak6gOET.js.map
