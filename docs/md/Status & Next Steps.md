# Status & Next Steps (2025-08-17)

This note captures the current runtime status and a concrete debugging routine for restoring RAG retrieval and Commit-to-Memory in the Main Chat v8.4 workflow.

## Status
- Main chat (text): Working
- Vision (single image): Working
- RAG retrieval (main chat): Not working (no RAG context shows up in Build OpenAI Payload1 input 0)
- Commit-to-Memory (auto-commit): Not working (webhook path/response not verified)

## Immediate verification checklist
- UI points to main chat webhook (v8.4) and includes chat_session_id, rag_session_id, and project_id in POST body.
- In n8n, HTTP Request1 (OpenAI) has Continue On Fail set to true; Code1 returns a single object.
- Respond to Webhook2 returns $node['Code1'].json with a fallback object when missing.

## Debug routine: RAG (Main Chat)
1) Entry gating
- Confirm If Rag is Active evaluates true when rag_session_id is present.
- On its false path, assert RAG nodes do not run; on true path, they do.

2) Embedding generation
- Create Query Embedding → enable Continue On Fail.
- If non-200, return a shaped error item; otherwise, capture data[0].embedding length (>1000 dims for text-embedding-3-small).

3) Vector search queries
- Verify both Postgres queries execute:
  - Retrieve Committed Memory (session scoped)
  - Retrieve RAG Chunks (project scoped)
- Add a Set node after each with counts: { rows: items.length } for quick visibility.

4) Consolidation
- RAG Context consolidator → ensure it outputs a single string field (e.g., rag_context) and then Format History for AI wraps it as role: 'system'.
- At Build OpenAI Payload1, inspect input 0 contains the system message with rag_context.

5) Smoke test
- Temporarily replace the consolidator output with a hard-coded system line and verify it appears in the final OpenAI messages.

## Debug routine: Commit-to-Memory
1) Feature flag and detector
- Config: Auto-Commit Enabled must be true; If Remember Intent regex should match messages starting with "remember" (case-insensitive).

2) Webhook call
- Confirm the webhook URL is live; enable Continue On Fail; log { status, body } into a Set node next to the HTTP call.
- Payload must include chat_session_id and rag_session_id; ensure IDs come from Preserve Current Inputs.

3) Downstream workflow
- Ensure the Commit-to-Memory workflow accepts the payload, computes summary → embedding → INSERT rag_store.
- It should respond with { rag_session_id? , toast? , status_line? } so Code1 can append a toast/status in the reply.

4) UI feedback
- If webhook fails or responds with error, Code1 should emit out.toast = { type: 'warning', message: 'Auto-commit failed' } to surface but not break chat.

## Success criteria
- RAG: A visible system message from RAG appears in Build OpenAI Payload1, and model replies reflect retrieved facts.
- Commit-to-Memory: Triggering a "remember …" message logs a success status and, optionally, updates rag_session_id.

## Notes
- See bootstrap.md for full context and node-level contracts.
- Recommend small temporary Set nodes for counts and status to make n8n Executions self-explanatory during debugging.
