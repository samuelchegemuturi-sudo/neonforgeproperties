import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-D3Dl5b08.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(null);
async function loadAccess(userId) {
	const { data: profile } = await supabase.from("profiles").select("id, company_id, full_name, email, phone, position, avatar_url, is_super_admin, status").eq("id", userId).maybeSingle();
	let company = null;
	let subscription = null;
	if (profile?.company_id) {
		const { data } = await supabase.from("companies").select("id, name, currency, country, status, activation_status, verification_status, is_demo, created_at").eq("id", profile.company_id).maybeSingle();
		company = data;
		const { data: subData } = await supabase.from("platform_subscriptions").select("status, current_period_end").eq("company_id", profile.company_id).maybeSingle();
		subscription = subData;
	}
	const { data: roleRows } = await supabase.from("user_roles").select("role_id, roles(id, name, slug)").eq("user_id", userId);
	const roles = (roleRows ?? []).map((row) => row.roles).filter((r) => Boolean(r));
	let permissions = [];
	if (roles.length) {
		const { data: perms } = await supabase.from("role_permissions").select("permission_key").in("role_id", roles.map((r) => r.id));
		permissions = Array.from(new Set((perms ?? []).map((p) => p.permission_key)));
	}
	if (profile?.position === "Landlord") {}
	return {
		profile: profile ?? null,
		company,
		roles,
		permissions,
		subscription
	};
}
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
			setSession(nextSession);
			setLoading(false);
			if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
				if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
			}
		});
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		return () => sub.subscription.unsubscribe();
	}, [queryClient]);
	const userId = session?.user.id ?? null;
	const { data: access, isLoading: accessLoading } = useQuery({
		queryKey: ["access", userId],
		enabled: Boolean(userId),
		queryFn: () => loadAccess(userId),
		staleTime: 6e4
	});
	const value = (0, import_react.useMemo)(() => {
		const permissions = access?.permissions ?? [];
		const isSuper = access?.profile?.is_super_admin ?? false;
		const isLandlord = access?.profile?.position === "Landlord";
		const can = (key) => isSuper || isLandlord || permissions.includes(key);
		return {
			session,
			user: session?.user ?? null,
			loading,
			access: access ?? null,
			accessLoading: Boolean(userId) && accessLoading,
			can,
			canAny: (keys) => keys.some(can),
			signOut: async () => {
				await queryClient.cancelQueries();
				queryClient.clear();
				await supabase.auth.signOut();
			}
		};
	}, [
		session,
		loading,
		access,
		accessLoading,
		userId,
		queryClient
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
//#endregion
export { useAuth as n, AuthProvider as t };
