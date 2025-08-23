# Bootstrap Handoff: Bob 21 – Main Chat + Image Flow (v8.4)

This prompt is designed to quickly rehydrate the next session with enough context to continue debugging and validating the current chat workflow and image handling path.

## Executive summary
- Goal: Reliable end-to-end chat (text + optional image) with UBLA-compliant image URLs, using n8n and OpenAI chat completions.
- Current workflow version: v8.4 (preferred). It uses a deterministic 3-input Build OpenAI Payload and returns a JSON object directly to the UI.
- Current status: Core chat and vision paths are working via v8.4. The RAG retrieval branch and the Auto-Commit “commit to memory” feature need final wiring to ensure the chat path runs even when RAG returns zero rows.
- Browser symptom when wiring is incomplete: Empty 200s (body {}), causing “Unexpected end of JSON input” in the UI if the response is misreported or missing.

## Clean Session Quickstart (recommended)
1) Import and activate
   - Import and activate `Master_Workflow_v8_4.SAN-CORE.min.json`.
   - Disable older/duplicate chat workflows to avoid port clashes.
2) Node options (must-do)
   - Webhook1: multipleMethods true; response headers include:
     - Access-Control-Allow-Origin: *
     - Access-Control-Allow-Methods: GET, POST, OPTIONS
     - Access-Control-Allow-Headers: Content-Type, Authorization
   - IF “Is Preflight (OPTIONS)?”: condition must check BOTH:
     - Access-Control-Request-Method header present
     - method equals OPTIONS
   - Pre-flight Request: set the same three CORS headers in Response Headers.
   - HTTP Request1 → OpenAI: set Continue On Fail = true; Response format = JSON.
   - Respond to Webhook2: set CORS headers (Origin, Methods, Headers) in Response Headers.
3) Primary wiring (ensures chat runs even if RAG returns zero rows)
   - Build OpenAI Payload1 inputs MUST be:
     - Input 0 → Format Current Input (primary driver; always produces 1 item)
     - Input 1 → Format Recent History
     - Input 2 → Format History for AI (RAG context)
   - The code in Build OpenAI Payload1 should read all inputs with `$input.all(i)` and treat missing inputs as empty arrays.
4) RAG branch safety
   - Postgres nodes (“Retrieve Committed Memory”, “Retrieve RAG Chunks”) may legitimately return zero rows; that’s fine.
   - Ensure the RAG Context consolidator can handle zero input without crashing:
     - Use `$input.all()` (not an undefined `allItems`).
     - Either wire a pass-through input that always fires (e.g., from “Preserve Current Inputs”) or keep RAG on Input 2 of Build so the primary path doesn’t depend on RAG outputs.
     - Optional: enable “Always Output Data” on the RAG consolidator if you want it to emit a benign context string when empty.
5) Frontend quick checks
   - Use `Chat_8_V8.1.html`.
   - Ensure fetch sets `Accept: application/json` and uses a tolerant JSON reader.
   - If the browser shows empty 200s, the server likely responded with `{}` or a misreported body; the UI should show the raw text fallback and not crash.

## Architecture snapshot
- Image uploads: Google Cloud Storage with Uniform Bucket-Level Access (UBLA). Public access via V4 signed URLs (no object ACLs). Signing uses IAM Credentials `signBlob` with `GOOG4-RSA-SHA256`.
- Orchestration: n8n. Key nodes in the main chat workflow:
  - Format Current Input (handles text + image URLs/attachments)
  - Build OpenAI Payload1 (three inputs):
    0) Current input (primary)
    1) Recent history
    2) RAG context
    Outputs `{ model, messages, usedVision }`.
  - HTTP Request1 → OpenAI `POST /v1/chat/completions`
    Body: `{ model: {{$json.model}}, messages: {{$json.messages}} }`
    Response: JSON; Continue On Fail enabled.
  - Code1: Shapes the AI response into `{ reply, usedVision, selected_model?, rag_info?, toast? }`.
  - Respond to Webhook2: `responseBody = {{$node['Code1'].json}}` (explicit object) with CORS headers.

## What was recently fixed
- Stricter preflight detection (header present AND method=OPTIONS) and explicit CORS headers on preflight and final responders.
- Build OpenAI Payload1 normalized to ES5 and now resilient to missing inputs.
- Code1 returns a compact JSON object with rag diagnostics and optional toast.
- Defensive “Format Data for Vector Search” resolves `rag_session_id` from multiple sources and guards missing embeddings.

## Feature status (2025-08-18)
- Core chat (text): Working when Build’s primary input is Current Input (Input 0).
- Vision (single image): Working; `usedVision` reflects presence of image parts.
- RAG retrieval in main chat: Works when DB returns rows; if not, chat still proceeds without RAG.
- Auto-Commit “Commit to Memory”: Available; verify downstream webhook is active in your environment.

## Active issues to verify/finish
1) Build node not firing when RAG returns zero rows
   - Cause: Build’s primary input wired to RAG path; with no items, the node never runs.
   - Fix: Wire Build Input 0 to Format Current Input (primary), Input 1 to Format Recent History, Input 2 to RAG context.
2) RAG Context consolidator `allItems`
   - Ensure consolidator uses `const allItems = $input.all();` and handles empty arrays.
3) Empty HTTP response body
   - Keep “Continue On Fail” in HTTP Request1 so Code1 can return structured fallbacks.
   - Respond to Webhook2 must always use Code1’s JSON object and include CORS headers.

## Repro steps (for next session)
- Activate SAN-CORE v8.4.
- Verify Build inputs wiring per Clean Session Quickstart.
- In the UI, try:
  1) Plain text: expect JSON `{ reply, usedVision:false, selected_model }`.
  2) Text + image: expect `{ ..., usedVision:true }`.
  3) With/without RAG rows: reply should still appear; debug badge shows rag_info counts.

## Debug plan for RAG and Commit-to-Memory
RAG (retrieval path in Main Chat):
- Confirm `If Rag is Active` evaluates truthy only when `rag_session_id` is present.
- Ensure “Create Query Embedding” returns a vector; check model and credentials.
- Validate Postgres queries; using `$3::vector` with a string like `[0.1,...]` is acceptable. If your driver needs explicit cast, keep `::vector` as in current query.
- If both queries return zero rows, that’s fine; chat continues without RAG.

Commit-to-Memory:
- Confirm feature flag node enables auto-commit.
- Check the webhook URL and payload; watch for toasts returned from the commit path.

## Expected data contract (UI ↔ n8n)
- Response JSON (happy path):
  {
    "reply": "string",
    "usedVision": true,
    "selected_model": "gpt-4o",
    "rag_info": { "committed_count": 0, "chunk_count": 0, "top_distances": [] }
  }
- Error path (recommended): include `error` object and a `toast` with a friendly message.

## Node settings to double-check (v8.4)
- Build OpenAI Payload1
  - Inputs: 0=Current input, 1=recent history, 2=RAG context.
  - Reads inputs with `$input.all(i)` and handles empty arrays.
- HTTP Request1
  - URL: `https://api.openai.com/v1/chat/completions`
  - Method: POST; Body `{ model, messages }`; Response=JSON; Continue On Fail=true.
- Code1
  - Returns `{ reply, usedVision, selected_model?, rag_info?, toast? }`.
- Respond to Webhook2
  - Respond With: JSON; Body: `={{ $node['Code1'].json }}`; CORS headers present.

## Frontend hardening
- Fetch includes `Accept: application/json` and a tolerant JSON reader.
- Optional 25s timeout using AbortController to prevent UI lock-ups.

## Performance tips (each turn feels slow)
- Set HTTP Request1 timeout (e.g., 25–30s) and disable excessive retries.
- Keep payloads lean (truncate context/history if overly long).
- Avoid heavy console logging in Code nodes.
- If needed, test a lighter model for drafts.

## Quick test matrix
- Text only → reply present, usedVision=false.
- Text + image → reply present, usedVision=true.
- RAG empty → reply present; rag_info shows zero counts.
- OpenAI error → reply with `error` + toast; 200 returned with JSON.

## If things still fail
- Check that Build input 0 is from “Format Current Input”.
- Ensure Respond to Webhook2 runs (green dot) and shows Code1 JSON.
- If Postgres nodes show “No output data returned”, that’s OK; ensure it doesn’t block Build.

---

Changelog (rolling)
- 2025-08-18: Added Clean Session Quickstart; clarified Build input wiring and RAG empty behavior; CORS checklist; performance/timeouts.
- 2025-08-17: Core Chat Test Code1 fixed to always return a single item; added safe fallback for empty upstream.
- 2025-08-17: Webhook POST branch explicitly wired to Build; fixed import issues for Code node jsCode.

---

Appendix: About the “minified” workflow export
- The `.min.json` is the same workflow with whitespace removed and any node `jsCode` strings flattened/escaped for reliable import and smaller file size.
- When to use non-minified: during editing/review in version control (easier diffs/reads).
- When to use minified: sharing/importing in n8n or moving between systems where multiline strings can corrupt JSON.

Sync policy and which file to import
- Source of truth: keep and edit the non-minified `*.json` files.
- Import for tests: prefer the matching `*.min.json` files to avoid newline/escaping issues.
- Regeneration: after any edit, run `tools/minify_workflows.ps1` to refresh all `*.min.json` siblings.
- If you hand-edit right before import, you may import the non-minified file; otherwise, use the `.min.json`.

Final additional notes:
•	Workflows to import:
o	Fast iteration: Master_Workflow_v8_4.SAN-CORE.min.json
o	Full stack: Master_Workflow_v8_4.SAN.min.json
•	UI file: Chat_8_V8.1.html (client timeout ≈ 25s)
•	Webhook CORS invariants (all chat/commit/setup):
o	Access-Control-Allow-Origin: *
o	Access-Control-Allow-Methods: POST, OPTIONS
o	Access-Control-Allow-Headers: Content-Type, Authorization
o	Apply on both Webhook and Respond to Webhook nodes
o	Preflight IF must check header present AND method=OPTIONS
•	Build node inputs (must be exact):
o	0 = Format Current Input (primary), 1 = Format Recent History, 2 = RAG context
•	Response contract to UI:
o	{ reply, usedVision, selected_model?, rag_info?, toast? }
•	URLs to verify in UI:
o	CHAT_WORKFLOW_URL, COMMIT_MEMORY_WORKFLOW_URL, LIST_PROJECTS_URL (point to active Test or Production endpoints)
•	Debug:
o	Badge shows model + RAG; click to toggle debug tray
