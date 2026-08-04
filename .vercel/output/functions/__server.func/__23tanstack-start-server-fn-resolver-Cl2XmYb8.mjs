//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-Cl2XmYb8.js
var manifest = {
	"343f9ad093c2ba9f18d395f9d96176ac40bea7240ae1cfec38dc6919a4cddf6d": {
		functionName: "adminDeleteUser_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"49dce7dc18003eda92e4bdf6fcd0143d37890bf1d504c4d673b7827496bcaf0a": {
		functionName: "registerUserFn_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"668533e1fc5928b020a8cd3a20d946dda0be2544498131efc892b853e45d23df": {
		functionName: "adminResetPassword_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"6d36bc45ca407f78c14d76e16b9cf58743414f2ec9d560a98d339ce5b4ac945e": {
		functionName: "adminCreateCompany_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"6f3d2b4d8ddaa9601a0ba48e76ee6b1269535c5b5ce44ed2f0b4dc8decb6e59c": {
		functionName: "sendEmailFn_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"7ba3a186d0e26b31a3624cdfaf215d1f588c96730fdd119fd8a123e18e219e26": {
		functionName: "renewSubscriptionFn_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"8103abbaf2058c695856cb672ded681604cf450dfff39937825fb48825202412": {
		functionName: "requestPasswordReset_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"8873cfceadb96d6d8057cedaad8a931df1a4685bcb709788439267c45ca85d9b": {
		functionName: "registerCompanyFn_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"9b0c4adc2384253b9e83ed96d4be02c2d6b3245c5d2ab4c46ca69ff60c43face": {
		functionName: "adminCreateOfficer_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"a8977811895c47b2ce256a56362f34236e50a10a970e0403d73598fad490d0b1": {
		functionName: "activateTrialSubscriptionFn_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"ebe4d4bfe39cdb19e0c23c40e4b45fc60159cec8d4d2377495d0775dd064a997": {
		functionName: "companyCreateEmployee_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"f10fcc983a0bad621955a5cda37283380d73fc439c6abb7a2546aa48c4ff3b71": {
		functionName: "adminDeleteCompany_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	},
	"fc287c4a9242a94cfa3ad4ba4076640c10102748ee436751fcfd239d9fc3fd5a": {
		functionName: "adminResetTemporaryPassword_createServerFn_handler",
		importer: () => import("./_ssr/platform.functions-D2yX3bHl.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
