(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/node_modules/.pnpm/fumadocs-core@15.5.3_@types+react@19.1.8_next@15.3.3_react-dom@19.1.0_react@19.1.0__rea_8b3a17cceeb8dcd4869e83cd6e8b3d25/node_modules/fumadocs-core/dist/algolia-NXNLN7TR.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/search/client/algolia.ts
__turbopack_context__.s({
    "groupResults": (()=>groupResults),
    "searchDocs": (()=>searchDocs)
});
function groupResults(hits) {
    const grouped = [];
    const scannedUrls = /* @__PURE__ */ new Set();
    for (const hit of hits){
        if (!scannedUrls.has(hit.url)) {
            scannedUrls.add(hit.url);
            grouped.push({
                id: hit.url,
                type: "page",
                url: hit.url,
                content: hit.title
            });
        }
        grouped.push({
            id: hit.objectID,
            type: hit.content === hit.section ? "heading" : "text",
            url: hit.section_id ? `${hit.url}#${hit.section_id}` : hit.url,
            content: hit.content
        });
    }
    return grouped;
}
async function searchDocs(query, { indexName, onSearch, client, locale, tag }) {
    if (query.length > 0) {
        const result = onSearch ? await onSearch(query, tag, locale) : await client.searchForHits({
            requests: [
                {
                    type: "default",
                    indexName,
                    query,
                    distinct: 5,
                    hitsPerPage: 10,
                    filters: tag ? `tag:${tag}` : void 0
                }
            ]
        });
        return groupResults(result.results[0].hits).filter((hit)=>hit.type === "page");
    }
    return [];
}
;
}}),
}]);

//# sourceMappingURL=fbf7f_fumadocs-core_dist_algolia-NXNLN7TR_443fa9e7.js.map