import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-HpbnEn4K.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-UH_Jp6hR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform.functions-xhJW-uih.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/** Super Admin: register a company offline and create its owner login. */
var adminCreateCompany = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.name?.trim()) throw new Error("Company name is required");
	if (!input.email?.trim()) throw new Error("Owner email is required");
	return input;
}).handler(createSsrRpc("6d36bc45ca407f78c14d76e16b9cf58743414f2ec9d560a98d339ce5b4ac945e"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email?.trim()) throw new Error("Email is required");
	return input;
}).handler(createSsrRpc("668533e1fc5928b020a8cd3a20d946dda0be2544498131efc892b853e45d23df"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email?.trim()) throw new Error("Email is required");
	if (!["platform_verification_officer", "platform_support_officer"].includes(input.roleSlug)) throw new Error("Unknown platform role");
	return input;
}).handler(createSsrRpc("9b0c4adc2384253b9e83ed96d4be02c2d6b3245c5d2ab4c46ca69ff60c43face"));
/** Company Admin: create an employee for their own company. */
var companyCreateEmployee = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email?.trim()) throw new Error("Email is required");
	if (!input.full_name?.trim()) throw new Error("Full name is required");
	if (!input.role_id) throw new Error("Role is required");
	return input;
}).handler(createSsrRpc("ebe4d4bfe39cdb19e0c23c40e4b45fc60159cec8d4d2377495d0775dd064a997"));
/** Super Admin: reset a user's password and return a new temporary password */
var adminResetTemporaryPassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email) throw new Error("Email is required");
	return input;
}).handler(createSsrRpc("fc287c4a9242a94cfa3ad4ba4076640c10102748ee436751fcfd239d9fc3fd5a"));
var sendEmailFn = createServerFn({ method: "POST" }).inputValidator((input) => {
	if (!input.to || !input.subject || !input.htmlContent) throw new Error("Missing fields");
	return input;
}).handler(createSsrRpc("6f3d2b4d8ddaa9601a0ba48e76ee6b1269535c5b5ce44ed2f0b4dc8decb6e59c"));
var adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("343f9ad093c2ba9f18d395f9d96176ac40bea7240ae1cfec38dc6919a4cddf6d"));
var adminDeleteCompany = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("f10fcc983a0bad621955a5cda37283380d73fc439c6abb7a2546aa48c4ff3b71"));
var registerCompanyFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.company_name?.trim()) throw new Error("Company name is required");
	return input;
}).handler(createSsrRpc("8873cfceadb96d6d8057cedaad8a931df1a4685bcb709788439267c45ca85d9b"));
var activateTrialSubscriptionFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("a8977811895c47b2ce256a56362f34236e50a10a970e0403d73598fad490d0b1"));
var renewSubscriptionFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("7ba3a186d0e26b31a3624cdfaf215d1f588c96730fdd119fd8a123e18e219e26"));
var registerUserFn = createServerFn({ method: "POST" }).inputValidator((input) => input).handler(createSsrRpc("49dce7dc18003eda92e4bdf6fcd0143d37890bf1d504c4d673b7827496bcaf0a"));
//#endregion
export { adminResetTemporaryPassword as a, registerUserFn as c, adminDeleteUser as i, renewSubscriptionFn as l, adminCreateCompany as n, companyCreateEmployee as o, adminDeleteCompany as r, registerCompanyFn as s, activateTrialSubscriptionFn as t, sendEmailFn as u };
