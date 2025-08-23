# Bootstrap v3 — Vision E2E Mission Only

TL;DR: Make image-based chats work end-to-end without breaking commit-to-memory or RAG. Keep scope tight. Validate usedVision flips to true and the reply references the image.

## Mission (single focus)
- Enable and verify vision inference in the baseline chat flow.
- Preserve reliability of:
  - Commit-to-memory
  - RAG retrieval and scoping
- Clean, object-shaped Respond node outputs (no pre-stringified JSON) on relevant paths.

## Baseline stack (do not change unless necessary)
- Frontend UI: `Chat_8_V8.2.html`
- Main workflow: `Master_Workflow_v8_1.json`
- Image handler: `Image_Handler_Workflow_v4.min.json` (v4 family; returns signed/public URL)
- DB: Postgres (`conversation_history`, `rag_store`, `memory_commit_log`, `project_contexts`)

## Contracts (strict)
Inbound Webhook (chat):
- Required: `chat_session_id`
- One of: `chatInput` | `imageUrl` | `imageData`
- Aliases accepted:
  - URL: `imageUrl` or `image_url`
  - Inline: `imageData` or `image_data` with `dataUri` (preferred) or `url`
- Scoping: `project_id`, `rag_session_id` as provided

Outbound Webhook (chat response):
- Object with fields: `reply`, `selected_model`, `usedVision`, optional `toast`

Setup/Create project Respond:
- Object with: `chat_session_id`, `rag_session_id` (no JSON.stringify)

Commit-to-memory Respond:
- Object with: `status`, `toast`, `status_line`, `chunks_committed`, `project_id`, `rag_session_id`

## Core mechanics to keep
- Format Current Input builds OpenAI-vision content when image present:
  - `[ { type: 'text', text: ... }, { type: 'image_url', image_url: { url, detail: 'auto' } } ]`
  - Accepts both camelCase/snake_case for image fields
  - Inline fallback via `imageData.dataUri | datauri | url`
- Build OpenAI Payload picks a vision-capable model automatically when an image is present
  - Default: `gpt-4o` for both text and vision unless overridden by `vision_model`
- Respond nodes return JSON objects (not stringified strings)

## E2E smoke test (UI)
1) In `Chat_8_V8.2.html`, attach an image (prefer public URL; inline fallback allowed).
2) Prompt: “Describe the image and list three visible details.”
3) Expect response JSON to include:
   - `usedVision: true`
   - `selected_model: gpt-4o` (or override)
   - `reply` references the image content

## Troubleshooting quick checks
- usedVision=false:
  - Confirm inbound payload included `imageUrl` or `image_url` (or `imageData{dataUri|url}`)
  - Verify Format Current Input output is an array with an `image_url` part
  - Build OpenAI Payload should then pick the vision model
- Empty/garbled UI response:
  - Ensure Respond nodes return plain objects (no JSON.stringify)
  - UI uses tolerant parsing; check debug tray’s “last payload/response”
- Image URL access:
  - Prefer the signed/public URL from image handler; if blocked, inline data URI fallback is supported

## Non-goals (avoid distractions now)
- Persona redesign, prompt rewrites, multi-image, or multi-model routing beyond the above
- Changing RAG schemas or long-term memory architecture
- Large UI refactors

## Minimal pending items
- Validate usedVision toggles true in prod with the smoke test
- If still false, force model selection to vision when inbound has any image field (toggle in Build OpenAI Payload)

## Definitions (for consistency)
- Vision content part: `{ type: 'image_url', image_url: { url, detail: 'auto' } }`
- Image fields accepted anywhere: `imageUrl|image_url`, `imageData|image_data`
- Inline data: `imageData.dataUri | imageData.datauri | imageData.url`

## Done criteria
- Image prompts produce descriptions grounded in the image
- `usedVision: true` and correct model in responses
- No regression in commit-to-memory and RAG paths
