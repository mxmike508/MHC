# Bootstrap v2 — Bob Chat + Images Handoff

Purpose: When the chat context resets, this file primes the next Copilot with the minimum they need to be useful in minutes—not hours.

## 1) Where we are
- We had a stable build (v8.0) where chat + commit‑to‑memory + recall worked.
- We added images (GCS/upload). Images worked, but commit/RAG broke. Fixes to commit/RAG broke images again.
- We are deciding between two paths:
  - Option A: Start from v8.0 and add simple base64 images (no storage) first.
  - Option B: Keep the version where images worked and repair ID handling for commit/RAG.

## 2) What “working” means (success criteria)
- Chat: POST returns a reply field (or equivalent text) for the user.
- Commit: inserts into conversation_history and rag_store; returns a stable rag_session_id (new or same) and does not lose IDs.
- Images: when present, exactly one of imageData (base64) or imageUrl is passed; the presence of an image must not change IDs.

## 3) Canonical keys (Master Data Contract)
- UI → Workflow: project_id, chat_session_id, rag_session_id, chatInput, optional imageData (data URI) or imageUrl.
- Workflow → UI: reply; session_id is allowed as a response alias for chat_session_id; rag_session_id must remain rag_session_id.
- Accept legacy/mixed‑case only at ingress. Everywhere else, keep canonical names.

## 4) Live artifacts (as of this doc)
- UI: Chat_8_V8.0_HOTFIX.html (loads BAK/Chat_8_V8.html baseline).
- Workflows (n8n): Image_Handler_Workflow_v4.min.json; Master_Workflow_v8_6_SAN_CORE.min.json; Core_Chat_Test_v1.min.json. Earlier versions also exist in BAK/ and _archive/.

## 5) Minimal UI behaviors
- Always send both IDs in body: project_id, chat_session_id, rag_session_id (rag may be null).
- If backend returns rag_session_id, update local state immediately.
- For images (Option A): send in the same chat POST as imageData (data URI). Avoid storage while stabilizing.
- Keep toasts optional and cosmetic; don’t let them change $json.

## 6) Workflow ingress rules (staging)
- Do ID normalization in a single Code node immediately after the webhook.
- Read from both top level and .body; accept canonical and legacy names; emit canonical only.
- Never overwrite lane‑local $json with HTTP node results. Nest under e.g. http_response.
- Combine IDs by pairing item[0] (payload) with item[0] (DB lookup) and prefer payload values if present.
- If DB lookup by chat_session_id is used, keep it on a separate input and never clobber payload.

### Ingress Normalize (n8n Code node)
```
// Input: items
// Output: normalized items with canonical keys only
function pick(o, keys){ for (const k of keys) { if (o && o[k] != null && o[k] !== '') return o[k]; } }

return items.map(item => {
  const src = item.json?.body ?? item.json ?? {};
  const out = { ...item.json };
  const get = (names) => pick(src, names);

  out.project_id      = pick(out, ['project_id'])      ?? get(['project_id','project_Id','ProjectId']);
  out.chat_session_id = pick(out, ['chat_session_id']) ?? get(['chat_session_id','session_id','session_Id','chatSessionId']);
  out.rag_session_id  = pick(out, ['rag_session_id'])  ?? get(['rag_session_id','rag_session_Id','ragSessionId']);
  out.chatInput       = pick(out, ['chatInput'])       ?? get(['chatInput','ChatInput','input']);
  out.imageData       = pick(out, ['imageData'])       ?? get(['imageData']);
  out.imageUrl        = pick(out, ['imageUrl'])        ?? get(['imageUrl','url']);

  return { json: out };
});
```

### Combine IDs (n8n Code node with 2 inputs)
- Input 0: normalized payload (from Ingress Normalize)
- Input 1: DB row(s) from lookup by chat_session_id (optional)
```
const p = $input.all(0);
const d = $input.all(1);
function val(x){ return x != null && x !== ''; }
function get(o,k){ return (o && val(o[k])) ? o[k] : undefined; }

const out = [];
for (let i=0;i<p.length;i++){
  const pj = p[i]?.json ?? {};
  const dj = (d[i]?.json ?? d[0]?.json ?? {}) || {};
  out.push({ json: {
    project_id:      get(pj,'project_id')      ?? get(dj,'project_id'),
    chat_session_id: get(pj,'chat_session_id') ?? get(dj,'chat_session_id') ?? get(dj,'session_id'),
    rag_session_id:  get(pj,'rag_session_id')  ?? get(dj,'rag_session_id'),
    chatInput:       get(pj,'chatInput'),
    imageData:       get(pj,'imageData'),
    imageUrl:        get(pj,'imageUrl'),
    _payload: pj,
    _db: dj
  }});
}
return out;
```

## 7) Image modes
- Mode A (staging first): Inline base64 (imageData) in the chat POST. No storage. Easiest to stabilize.
- Mode B (later): URL from Image Handler/GCS. Keep the same canonical IDs and do not let HTTP nodes overwrite $json.

## 8) Smoke tests (run in this order)
1. Chat: Send text only. Expect reply. No null IDs.
2. Commit: Click commit; check DB:
   - conversation_history shows new rows for this session_id.
   - rag_store gets a summary row with non‑null project_id and session_id.
3. Image echo: Send a prompt with one image. Expect normal reply and no ID changes.

## 9) SQL quick checks
```
SELECT id, session_id, role, content
FROM conversation_history
ORDER BY id DESC
LIMIT 15;
```
```
SELECT id, project_id, session_id, role, LEFT(original_content, 140) AS original_preview
FROM rag_store
ORDER BY id DESC
LIMIT 15;
```

## 10) Workspace hygiene (to reduce thrash)
- Keep a STAGING/ folder with only the files you are actively changing (UI + 1 workflow JSON). Everything else stays in BAK/ or _archive/.
- Minified workflow JSONs are large; avoid opening them unless needed. When possible, keep a readable non‑minified copy for edits and re‑minify at export time.
- Large workspaces do not automatically “eat tokens” each turn; tokens are spent when the assistant reads big files or long history. A smaller STAGING folder speeds searches and reduces accidental large reads.

## 11) Decision snap‑frame
- If you need images today and can skip storage: choose Option A and add base64 images to v8.0.
- If you must keep GCS right now: choose Option B and apply only the two nodes above (Normalize + Combine). Do not change the image nodes.

## 12) Update log
- 2025‑08‑19: Initial bootstrap v2 created with options A/B, node snippets, smoke tests, and SQL checks.
