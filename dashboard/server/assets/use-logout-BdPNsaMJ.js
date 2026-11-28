import { a as useTRPC, b as useMutation, b8 as forgetOnboardingKeys } from "./router-gBnYxPzA.js";
function useLogout() {
  const trpc = useTRPC();
  const signOut = useMutation(
    trpc.auth.signOut.mutationOptions({
      onSuccess() {
        forgetOnboardingKeys();
        window.location.href = "/";
      }
    })
  );
  return signOut;
}
export {
  useLogout as u
};
//# sourceMappingURL=use-logout-BdPNsaMJ.js.map
