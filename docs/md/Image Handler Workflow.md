# Image Handler Workflow (n8n) — Setup Guide

This workflow offloads image uploads from the Chat UI, returns a URL, and lets the chat send only `imageUrl` to the Main Chat workflow.

## Contract
- Input: multipart/form-data with field `file` (required); optional `project_id`, `chat_session_id`.
- Output (JSON): `{ "url": "https://.../your-image.jpg" }` on success; 4xx/5xx with a short error string otherwise.
- CORS: Allow `*` for now (tighten later). Support OPTIONS preflight.
- Size/MIME: Enforce max 5 MB and allow PNG/JPEG/WEBP.

## Quick Steps in n8n
1. Add a Webhook node
   - Methods: `POST` and `OPTIONS`
   - Path: something like `image-upload-handler`
   - Response mode: Response Node
   - Response headers:
     - `Access-Control-Allow-Origin: *`
     - `Access-Control-Allow-Methods: POST, OPTIONS`
     - `Access-Control-Allow-Headers: Content-Type, Authorization`

2. Add a Code node “Validate & Extract” (JS)
   - Purpose: Validate form-data, size, and mime; surface a clean error.
   - Sketch:
     - Read `const body = $json.body` (n8n exposes parsed fields for small uploads; for larger uploads use Binary mode and `item.binary`)
     - If using Binary: ensure `items[0].binary.data` exists; check `mimeType` and `fileSize`
     - Throw `new Error('Unsupported type')` or `new Error('Too large')` if invalid

3. Storage step (choose one)
   - Cloud Storage (recommended):
     - GCS/S3/R2: Use credentials; generate a unique key like `project_id/chat_session_id/timestamp_filename`
     - Upload binary using an HTTP Request (PUT) or dedicated node
     - Make the object publicly readable or return a signed URL
   - Fallback (temporary):
     - If you don’t have storage ready, echo back a Data URI for testing. Note this is only for local debug; do not use in production.

4. Add a Respond to Webhook node
   - Respond with JSON body: `{ "url": "{{$json.publicUrl}}" }`
   - Include CORS headers as in the Webhook node.

## Suggested Node Order
Webhook (POST/OPTIONS) → Validate & Extract (Code) → Upload (HTTP or Storage Node) → Set `{ publicUrl }` (Set node) → Respond to Webhook (JSON)

## UI Wiring
- Open `Chat_8_V7.7.html` and set:
  - `const IMAGE_HANDLER_WORKFLOW_URL = 'https://<your-n8n-host>/webhook/<your-path-or-id>'`
- The UI will:
  - POST `multipart/form-data` to the handler
  - Preview the returned URL
  - Send only `imageUrl` to the Main Chat workflow
  - Fallback to inline `data:` when the handler is not configured or upload fails

## Main Chat Workflow Changes (already applied)
- Accepts `imageUrl` or legacy `imageData`
- Builds the OpenAI payload using `image_url.url = imageUrl` when present

## Troubleshooting
- 413/Request Entity Too Large: Verify the handler uses Binary mode and your platform’s max body size is >5 MB.
- CORS: Ensure OPTIONS is handled and all three headers are present.
- Mixed content: If serving the UI via http:// and URLs are https:// you’re fine; the reverse (http images on https UI) will be blocked.

## Next improvements
- Virus scan hook
- Signed URLs expiring after N hours
- Thumbnails/resizing before upload
