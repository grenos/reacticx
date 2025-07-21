module.exports = {

"[project]/node_modules/.pnpm/fumadocs-core@15.5.3_@types+react@19.1.8_next@15.3.3_react-dom@19.1.0_react@19.1.0__rea_8b3a17cceeb8dcd4869e83cd6e8b3d25/node_modules/fumadocs-core/dist/fetch-ZSD7GUCX.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/search/client/fetch.ts
__turbopack_context__.s({
    "fetchDocs": (()=>fetchDocs)
});
var cache = /* @__PURE__ */ new Map();
async function fetchDocs(query, { api = "/api/search", locale, tag }) {
    const params = new URLSearchParams();
    params.set("query", query);
    if (locale) params.set("locale", locale);
    if (tag) params.set("tag", tag);
    const key = `${api}?${params}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const res = await fetch(key);
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();
    cache.set(key, result);
    return result;
}
;
}}),

};

//# sourceMappingURL=fbf7f_fumadocs-core_dist_fetch-ZSD7GUCX_d5d00b0c.js.map