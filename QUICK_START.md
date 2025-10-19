# NEW SESSION STARTUP - Quick Commands
**Updated**: October 14, 2025 | **Platform**: Bob AI v2.0 + Modular Container Architecture
**MCP Server Fix**: Virtual environment Python paths corrected for mholl user account
**⚠️ CRITICAL**: Read `FILE_PROTECTION_RULES.md` before modifying ANY code files

## 0. 🚨 BEFORE MAKING ANY CODE CHANGES:
```bash
# MANDATORY: Create git checkpoint before editing files
git add -A
git commit -m "CHECKPOINT: Before [describe what you're about to do]"

# Create timestamped backup of file you're about to edit
cp path/to/file.js path/to/file.js.BACKUP_$(date +%Y%m%d_%H%M%S)

# Read the session log to understand current state
cat PERSONA_REBUILD_SESSION_LOG.md
```

**Protected Files** (ALWAYS backup before editing):
- `ui-prototype-sandbox/modules/chat/*.js`
- `ui-prototype-sandbox/modules/config/*.js`
- `production/Chat_*.html`

**See**: `FILE_PROTECTION_RULES.md` for complete guidelines

## 1. GET CONTEXT (First thing to do):
```bash
# Get unified bootstrap context (v11 strategic docs + v7 recent session history)
# Default: Last 30 days of sessions (optimized for daily startup)
.venv/Scripts/python.exe mcp-server/session_context.py

# For deep troubleshooting, get FULL session history:
# .venv/Scripts/python.exe mcp-server/session_context.py --mode full

# For specific time period investigation:
# .venv/Scripts/python.exe mcp-server/session_context.py --mode range --start 2025-09-01 --end 2025-09-30

# IF RECOVERING FROM DOCKER RESTART (Sept 20, 2025):
# Read: docs/ED_CONTEXT_RECOVERY_2025_09_20.md FIRST for immediate context
```

## CURRENT STATUS (Sept 14, 2025):
🎉 **BREAKTHROUGH ACHIEVED** - BuilderTrend workflow processing 6 nodes deep!
**MCP TESTING SUCCESS** - Worker 3 approach works with real data
**ACTIVE DEBUGGING** - Currently at "Process Jobsites Data" node (session_id error)
**DATABASE & N8N** - Deployed and working, CSV parsing successful

## 2. START PLAYWRIGHT MCP SERVER:
```bash
.venv/Scripts/python.exe mcp-server/start_playwright.py
```
*Note: This starts the Playwright browser automation server for web interface navigation*

## 3. VERIFY MCP TOOLS:
```bash
.venv/Scripts/python.exe mcp-server/bob_ai_server.py list_tools
```
*Should show 8 tools: file_read, file_write, list_directory, git_status, workflow_analyze, construction_api_plan, session_auto_commit, **get_session_context***

## 4. CLAUDE CODE CLI ACCESS (INSTALLED September 3, 2025):
**Standalone Claude CLI**: ✅ Available for command line use
```bash
# Method 1: Direct path access (always works)
"C:\Users\mholl\AppData\Roaming\npm\claude.cmd" --version

# Method 2: Through custom launcher (PATH configured)
C:\Users\mholl\bin\claude.cmd --version
```

**Installation Details**:
- ✅ Node.js v24.7.0 installed via winget
- ✅ Claude Code CLI v1.0.102 installed via npm
- ✅ Launcher script created in user bin directory
- ✅ Voice Mode MCP server installed and configured with OpenAI API key
- 📋 Benefits: Standalone CLI, no VS Code dependency, better performance

## 8. BUILDERTREND INTEGRATION STATUS (September 14, 2025 - BREAKTHROUGH ACHIEVED):
🎉 **BuilderTrend CSV Integration**: **6 NODES PROCESSING SUCCESSFULLY**
- ✅ **Worker 3 MCP Testing**: `Worker Sandboxes/Worker 3/mcp_live_test_sandbox/`
- ✅ **Database Tables**: bt_jobsites, bt_invoice_bills, bt_rag_store created in BobMemory
- ✅ **Working Workflow**: CSV parsing, routing, and data flow successful
- ✅ **MCP Data Structure**: Real webhook format documented and working
- ✅ **Successful Nodes**: Webhook → Debug → Validation → CSV Parse → Route → Process
- 🔧 **Current Issue**: JavaScript session_id error in "Process Jobsites Data" node
- 📋 **Upload Method**: MCP payload testing (not traditional file upload)

**Test Files Available**:
- `buildertrend_InvoiceBillsPos_25911_Sample.csv` (Financial data)
- `buildertrend_Jobsites_25911_Sample.csv` (Project data)

## 🎯 SEPTEMBER 14, 2025 BREAKTHROUGH SUMMARY:

### **HISTORIC ACHIEVEMENT**: 
After 12+ failed attempts over multiple sessions, **Worker 3's MCP testing approach** achieved the first successful end-to-end processing of 6 workflow nodes.

### **KEY DISCOVERY**: 
**Traditional file uploads ≠ MCP webhook structure**
- ❌ **Previous failures**: Testing with manual file uploads (wrong data structure)
- ✅ **Breakthrough**: Testing with MCP payload format (correct data structure)

### **WORKING APPROACH**:
1. **Worker 3 MCP Testing**: `Worker Sandboxes/Worker 3/mcp_live_test_sandbox/`
2. **Mock Data Setup**: n8n webhook node with Worker 3's MCP payload
3. **Binary Data Fix**: Proper file object structure with metadata
4. **CSV Parser Success**: Custom decode node bridges MCP → CSV parser

### **CURRENT PROGRESS**:
✅ **Node 1**: BuilderTrend CSV Upload Webhook (receives MCP data)
✅ **Node 2**: DEBUG: Webhook Structure (analyzes data)  
✅ **Node 3**: Validate BuilderTrend CSV (routes to false branch - fixed)
✅ **Node 4**: Decode Base64 CSV Data (custom node - working)
✅ **Node 5**: Parse CSV Data (successful with metadata structure)
✅ **Node 6**: Route by Data Type (2 items routed successfully)
🔧 **Node 7**: Process Jobsites Data (session_id error - in progress)

### **NEXT PHASE**: Complete database integration and validate full pipeline

## 9. VOICE MODE STATUS (September 3, 2025 - COMPLETED):
**Voice Output Capability**: ✅ **WORKING - Text-to-Speech Operational**
- ✅ **Windows Speech Platform**: Successfully installed and tested
- ✅ **Text-to-Speech**: pyttsx3 + Windows SAPI working perfectly  
- ✅ **Claude Voice Assistant**: Custom integration created (`claude_voice.py`)
- ✅ **Build Tools**: Microsoft Visual C++ Build Tools 2022 installed
- ⚠️ **Voice Input**: Speech-to-text in development (microphone configuration needed)

**Voice Usage - READY TO USE**:
```bash
# Complete voice interface (speak TO Claude, hear responses)
.venv/Scripts/python.exe development_environment/voice_system/claude_voice_ready.py

# Test voice output only
.venv/Scripts/python.exe development_environment/voice_system/claude_voice_ready.py test

# Setup Windows Speech Recognition for input
.venv/Scripts/python.exe development_environment/voice_system/claude_voice_ready.py setup

# Voice commands: 'mute', 'unmute', 'quiet', 'listen', 'exit'
```

**MCP Voice Mode**: 
- ✅ OpenAI API key configured
- ⚠️ webrtcvad compilation blocked (Windows-specific issue)
- 🔄 **Alternative**: Windows Speech Platform working as primary solution

## 5. MCP SERVER TROUBLESHOOTING:
**Current Status**: MCP servers operational
```bash
# If MCP servers fail, try these commands:
# Kill any existing processes first
taskkill /f /im python.exe
# Then restart servers
.venv/Scripts/python.exe mcp-server/bob_ai_server.py list_tools
.venv/Scripts/python.exe mcp-server/start_playwright.py
```

## 5. CHECK CURRENT PLATFORM STATUS - September 9, 2025:

### **🎯 MAJOR ACHIEVEMENTS:**
- ✅ **Hostinger Migration Complete**: All infrastructure moved from Google VM to Hostinger VPS
- ✅ **Modular Container Architecture**: BuilderTrend-inspired UI with autonomous worker system  
- ✅ **Chat v10.4 Integration**: Full document upload, Excel analysis, n8n workflow integration
- ✅ **4 Autonomous Workers**: Proven multi-worker system with work order queue management
- ✅ **Production Infrastructure**: n8n.srv997771.hstgr.cloud with Xata PostgreSQL database

### **🏗️ CURRENT PLATFORM STATE:**
- **Bob AI Container**: `ui-prototype-sandbox/index.html` - Professional modular interface
- **Backend**: Hostinger n8n workflows with 7 operational endpoints
- **Database**: Xata PostgreSQL with SSL (main branch production ready)  
- **Workers**: 4 autonomous workers completed major infrastructure and UI tasks

## 7. v10.2 BASELINE ACHIEVEMENTS:
1. ✅ Document Upload Feature: Complete Excel/PDF/CSV/TXT/DOCX processing pipeline
2. ✅ Claude Preprocessor Fix: HTTPS image URLs working properly (no more base64 conversion failures)
3. ✅ File Organization: Standardized versioning across production/development folders
4. ✅ Working Credentials: All AI providers properly configured and restored
5. ✅ MCP Integration: Unicode encoding issues fixed in bob_ai_server.py
6. ✅ Playwright Capabilities: Browser automation tested and working
7. ✅ Construction Platform Vision: Complete wireframe and implementation roadmap ready
8. ✅ Multi-Agent System: Autonomous Worker #1 with command center coordination (Sept 4)
9. ✅ Excel Forecasting Analysis: Custom-Remodel workbook decoded (Contract/R/r/d/Dead classification)

## 6. AUTONOMOUS WORKER SYSTEM (September 9, 2025 - PRODUCTION READY):

### **🤖 WORKER SYSTEM STATUS:**
- ✅ **Autonomous Polling System**: Production-ready Node.js infrastructure with 228 lines of code
- ✅ **Multi-Worker Concurrency**: File locking, status management, error handling
- ✅ **Worker Naming Convention**: Specialized worker labels replace generic numbers
- ✅ **BuilderTrend Integration Ready**: Email-based CSV processing architecture designed
- ✅ **Complete Work Order Lifecycle**: pending → in_progress → completed automation

### **📋 CURRENT WORK ORDER SYSTEM:**
```bash
# Check available work orders
dir command_center\work_orders\pending\

# Check worker status  
type command_center\status_reports\worker_*_status.md

# Launch worker in external terminal (when needed)
"C:\Users\mholl\AppData\Roaming\npm\claude.cmd" --dangerously-skip-permissions
```

### **🎯 SPECIALIZED WORKER ASSIGNMENTS:**
- **"UI Dashboard Module and RAG Integration"**: (Former Worker #4) AI response formatting + navigation fixed
- **"Autonomous Polling System"**: Infrastructure architect - built production-ready polling system  
- **"System Validator"**: Validated autonomous system with comprehensive testing
- **"Test Worker"**: Clean validation of autonomous workflow (in progress)

### **🚀 BUILDERTREND INTEGRATION TEAM READY:**
- **"Project Manager"**: Coordinates BuilderTrend integration project
- **"Email Processing and N8N Workflow"**: CSV email automation specialist  
- **"Database Schema and Xata Integration"**: PostgreSQL architecture specialist
- **"CSV Processing and Data Validation"**: Data pipeline specialist

**⚠️ LAUNCH WORKERS IN EXTERNAL TERMINALS ONLY** - Prevents resource conflicts with main session

## 7. IMMEDIATE NEXT ACTIONS:

### **🚀 BOB AI MODULAR CONTAINER - READY FOR USE:**
```bash
# Open the professional modular interface
start "" "ui-prototype-sandbox\index.html"
```
**Features**: BuilderTrend-inspired UI, project selector, full chat integration, document upload

### **📋 CURRENT PRIORITIES:**
1. **Test Modular Container**: Verify "Start New Project" and chat functionality
2. **Monitor Work Orders**: Check `command_center/work_orders/pending/` for new tasks
3. **Deploy Autonomous Polling**: Future enhancement for true worker autonomy

### **🎯 NEXT PHASE READY:**
- ✅ **Autonomous Polling System**: Production deployed and validated  
- ✅ **BuilderTrend Architecture**: Email CSV processing design complete
- 🚀 **Project Manager Bootstrap**: Ready for BuilderTrend integration coordination
- 📧 **Email Integration**: 2x daily CSV processing pipeline designed

### **📊 BUILDERTREND INTEGRATION SCOPE:**
- **Data Sources**: InvoiceBillsPos + Jobsites CSV files via email
- **Processing**: Full/delta file handling with Xata PostgreSQL storage  
- **AI Integration**: RAG-searchable construction data with predictive analytics
- **Delivery**: Real-time project dashboard with variance tracking

---

## 📊 PLATFORM HEALTH CHECK:
- **n8n Backend**: https://n8n.srv997771.hstgr.cloud ✅ Operational
- **Database**: Xata PostgreSQL main branch ✅ Connected  
- **MCP Servers**: bob_ai_server.py + Playwright ✅ Available
- **Workers**: 4 autonomous workers ✅ Proven operational
- **UI**: Modular container ✅ Chat v10.4 compatible

**🎯 SYSTEM STATUS: PRODUCTION READY**

---
**Use this guide for immediate session startup, then proceed with current work priorities**
