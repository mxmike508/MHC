# Load Conversation History - Implementation Guide

**Created:** October 22, 2025
**Purpose:** Enable platform-agnostic conversation persistence for Chat v1.5.0

---

## 📦 New Workflow Created

**File:** `Load_Conversation_History_Workflow.json`
**Name:** "Load Conversation History"
**Nodes:** 3 (Webhook → Postgres → Respond)

### Workflow Structure:

```
[Webhook Trigger]
    ↓
[Postgres: Get Conversation History]
    ↓
[Respond: Return History]
```

---

## 🔧 Installation Steps

### Step 1: Import Workflow to n8n

1. Open your n8n canvas
2. Click **"Import from File"** (or use the import button)
3. Select: `Load_Conversation_History_Workflow.json`
4. Workflow will appear on canvas

### Step 2: Verify Postgres Credentials

1. Click on **"Postgres: Get Conversation History"** node
2. Verify credentials are set to: **"Postgres account"**
3. If credential missing, select your existing Postgres connection
4. Save node

### Step 3: Activate Workflow

1. Click **"Active"** toggle in top-right
2. Workflow should show as active (green indicator)

### Step 4: Get Webhook URL

1. Click on **"Webhook: Load History Trigger"** node
2. Copy the **Production URL** (will look like):
   ```
   https://n8n.srv997771.hstgr.cloud/webhook/load-conversation-history
   ```
3. Save this URL - you'll need it for the frontend

---

## 📡 API Endpoint Details

### Request Format

**Method:** POST
**URL:** `https://n8n.srv997771.hstgr.cloud/webhook/load-conversation-history`

**Payload:**
```json
{
  "session_id": "chat_1757595606",
  "max_context": 100
}
```

**Parameters:**
- `session_id` (required): The chat session ID to load
- `max_context` (optional): Number of messages to load (default: 100)

### Response Format

**Success Response:**
```json
{
  "success": true,
  "session_id": "chat_1757595606",
  "count": 15,
  "messages": [
    {
      "role": "user",
      "content": "Hello, can you help me?",
      "created_at": "2025-10-22T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Of course! How can I help?",
      "created_at": "2025-10-22T10:30:05Z"
    }
    // ... more messages in chronological order (oldest first)
  ]
}
```

**Notes:**
- Messages returned in **chronological order** (ASC) - oldest first
- Frontend can reverse if needed for display
- Empty array if no messages found
- CORS headers included for cross-origin requests

---

## 🔍 Testing the Endpoint

### Test with curl:

```bash
curl -X POST https://n8n.srv997771.hstgr.cloud/webhook/load-conversation-history \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "chat_1757595606",
    "max_context": 10
  }'
```

### Expected Result:
- Should return JSON with messages array
- Count should match number of messages
- Messages should be in chronological order

---

## 🛠️ Fix for Existing Master Workflow (LIMIT 6 Issue)

### Location:
**File:** `Master Workflow.json`
**Node:** "DB: Get Conversation History" OR "Get Recent history"
**Current Line:** ~1306

### Current SQL:
```sql
SELECT role, content
FROM conversation_history
WHERE session_id = $1
ORDER BY created_at DESC
LIMIT 6; -- Fetch more (e.g., 3 user, 3 AI) to ensure we get a few full turns
```

### Change To:
```sql
SELECT role, content
FROM conversation_history
WHERE session_id = $1
ORDER BY created_at DESC
LIMIT {{ $json.body.max_context || 6 }};
```

### How to Apply:

**Option A: Via n8n UI (Recommended)**
1. Open "Master Workflow" in n8n
2. Find node: "Get Recent history" (or "DB: Get Conversation History")
3. Click on node to open parameters
4. In the **Query** field, change `LIMIT 6;` to `LIMIT {{ $json.body.max_context || 6 }};`
5. Save node
6. Save workflow

**Option B: Via JSON File**
1. Open `Master Workflow.json` in text editor
2. Search for: `LIMIT 6;`
3. Replace with: `LIMIT {{ $json.body.max_context || 6 }};`
4. Save file
5. Re-import to n8n

### Why This Change:
- Makes the limit configurable from frontend
- Falls back to 6 if `max_context` not provided (backward compatible)
- Allows Chat v1.5.0 to send `cfg_max_context` setting (20-100)
- No breaking changes to existing functionality

---

## 🎯 Frontend Integration (Next Steps)

### Chat v1.5.0 Changes Needed:

**1. Add endpoint to chat module:**
```javascript
this.endpoints = {
    // ... existing endpoints
    loadHistory: 'https://n8n.srv997771.hstgr.cloud/webhook/load-conversation-history'
};
```

**2. Create function to load history:**
```javascript
async loadConversationHistoryFromBackend(sessionId) {
    try {
        const maxContext = parseInt(localStorage.getItem('cfg_max_context') || '100');

        const response = await this.fetchWithTimeout(this.endpoints.loadHistory, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                max_context: maxContext
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.messages) {
                // Populate localStorage with messages
                result.messages.forEach(msg => {
                    this.historyManager.addMessage(msg.role, msg.content);
                });

                // Display messages in UI
                this.displayHistoryMessages(result.messages);

                console.log(`✅ Loaded ${result.count} messages from database`);
            }
        }
    } catch (error) {
        console.error('Failed to load history from backend:', error);
        // Fall back to localStorage only
    }
}
```

**3. Call on project switch:**
```javascript
// In switchToExistingProject() or similar function
if (this.currentChatId) {
    await this.loadConversationHistoryFromBackend(this.currentChatId);
}
```

---

## ✅ Testing Checklist

After implementation:

- [ ] New workflow imported and active in n8n
- [ ] Webhook URL accessible
- [ ] Test API call returns messages from database
- [ ] LIMIT 6 fix applied to Master Workflow
- [ ] Frontend loads history on project open (same computer)
- [ ] Clear localStorage and verify history still loads
- [ ] Test from different computer (platform-agnostic validation)
- [ ] Verify chat bubbles display correctly
- [ ] Verify localStorage gets populated after loading from DB

---

## 📝 Notes

- **No changes to existing Master Workflow logic** - only LIMIT parameter made configurable
- **New workflow is completely independent** - can be modified/debugged separately
- **CORS headers included** - works with GitHub Pages deployment
- **Backward compatible** - existing functionality preserved

---

## 🚨 Troubleshooting

**Problem:** Workflow not appearing after import
**Solution:** Check n8n version compatibility, manually create nodes if needed

**Problem:** Postgres credentials error
**Solution:** Click node, re-select "Postgres account" credential, save

**Problem:** Empty messages array returned
**Solution:** Verify session_id exists in conversation_history table

**Problem:** CORS errors from frontend
**Solution:** Verify "Respond: Return History" node has CORS headers set

---

**Created by:** Claude Code AI Assistant
**Date:** October 22, 2025

---

## Version History

**v1.1.0** (October 23, 2025)
- Added Code node to normalize Postgres response
- Fixes: Always returns array (prevents undefined messages)
- Fixes: Handles empty results gracefully
- Updated field names: `session_id` → `chat_session_id` (per Master Data Contract)

**v1.0.0** (October 22, 2025)
- Initial workflow creation
- 3 nodes: Webhook → Postgres → Respond
- Basic conversation history loading
