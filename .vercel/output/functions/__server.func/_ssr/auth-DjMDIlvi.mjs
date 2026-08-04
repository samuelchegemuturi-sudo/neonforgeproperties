import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as objectType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DjMDIlvi.js
var $$splitComponentImporter = () => import("./auth-DwkzSUma.mjs");
var searchSchema = objectType({ mode: enumType(["signin", "signup"]).optional() });
var Route = createFileRoute("/auth")({
	validateSearch: searchSchema,
	head: () => ({ meta: [
		{ title: "Sign in — Neon Forge Properties" },
		{
			name: "description",
			content: "Sign in to your Neon Forge Properties property management workspace."
		},
		{
			property: "og:title",
			content: "Sign in — Neon Forge Properties"
		},
		{
			property: "og:description",
			content: "Access your Neon Forge Properties property management workspace."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
