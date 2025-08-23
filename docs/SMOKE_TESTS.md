# Quick Smoke Tests

Run these two tests in the staging wrapper pages so we can decide Option A (v8.0 + base64 images) vs Option B (keep image pipeline + fix IDs).

## 1) Commit/Recall test (no image)
- Open Chat_8_V8.0_HOTFIX.html.
- New project → ask 2 short messages (e.g., "Color?", "Blue.").
- Click "Commit to Memory" once.
- Ask: "What color did I say?". Expect correct recall.
- If recall fails, screenshot the [debug] tray.

## 2) Single Image Q&A test
- Open Chat_8_V8.2_STAGING.html.
- Start new project.
- Type a short prompt like: "What is in the image?".
- Attach ONE image via Upload button or paste from clipboard.
- Send. Expect a relevant answer and no ID-null errors in [debug].

Notes
- If image upload fails, V8.2 falls back to inline base64 and still sends it.
- Confirm the payload contains at least one of: `imageUrl` or `imageData.dataUri`.
- IDs must be present: `project_id`, `chat_session_id`, and a non-empty `rag_session_id`.

Decision
- If both pass: choose Option B. We’ll apply only Normalize + Combine fixes and keep your image handler.
- If #2 fails (images): choose Option A. We’ll keep v8.0 baseline and add simple base64 image path.
