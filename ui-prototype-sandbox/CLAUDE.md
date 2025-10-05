# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🛑 CRITICAL: Code Change Authorization Protocol

**DISCUSSION ≠ AUTHORIZATION TO CHANGE CODE**

### Understanding User Intent:
- **Discussion**: User asks questions, explains problems, discusses solutions, says "this should be fixed", "we need to change X", or "this is broken"
- **Authorization**: User explicitly says "implement this", "make these changes", "go ahead", "do it", or "proceed with the implementation"

### Required Process:
1. **Engage in discussion** - Answer questions, analyze issues, suggest solutions
2. **Present clear plan** - Explain exactly what changes would be made
3. **Explicitly ask for permission** - "Would you like me to implement these changes?" or "Should I proceed with making these modifications?"
4. **Wait for explicit authorization** - Do NOT assume discussion means "go ahead"
5. **Only then make changes** - After receiving clear "yes, do it" confirmation

### Examples:
❌ **DO NOT ASSUME THESE MEAN "MAKE CHANGES":**
- "The chat module is broken and needs to be reverted"
- "We should implement feature X" 
- "This code has problems"
- "How would you fix this?"

✅ **THESE ARE CLEAR AUTHORIZATIONS:**
- "Yes, go ahead and implement that"
- "Make those changes now"
- "Proceed with the fix"
- "Do it"

**WHEN IN DOUBT, ASK FOR EXPLICIT PERMISSION**

## 🚨 CURRENT STATUS - READ FIRST

**STABLE**: Chat module v1.4.4 + Config module v1.7 - Complete through "Bite #6"
**DEPLOYED LOCALLY**: All features functional including localStorage enhancements
**TESTING**: Version v1.4.4 created to verify GitHub Pages deployment
**SUCCESS**: Advanced config section + export/import + API timeout + max context + cross-domain localStorage

### 🚨 DEPLOYMENT VERIFICATION IN PROGRESS
**Version v1.4.4 Test Deployment**
- **File**: `modules/chat/chat-v1.4.4.js` (copy of v1.4.3)
- **Purpose**: Verify GitHub Pages is loading current code
- **Test**: If GitHub Pages shows v1.4.4, deployment is working
- **Status**: Awaiting GitHub Pages confirmation

## ⚡ Quick Reference

| Command | Purpose |
|---------|---------|
| `python -m http.server 8080` | Start development server |
| `start index.html` | Open app (Windows) |
| `window.bobAiDebug.loadModule('chat')` | Test module loading |
| `window.bobAiDebug.clearCache()` | Clear module cache |

| Version | Status | Notes |
|---------|--------|-------|
| v1.4.4 | ✅ **CURRENT STABLE** | Test deployment version (copy of v1.4.3) |
| v1.4.3 | ✅ Complete | localStorage enhancement + cross-domain fix |
| v1.4.2 | ✅ Complete | Model selection + database branch integration |
| v1.4.1 | ✅ Complete | Model selection integration + smart AI routing |
| v1.4 | ✅ Complete | Config integration + stable baseline |

| Config Version | Status | Notes |
|---------------|--------|-------|
| v1.7 | ✅ **CURRENT STABLE** | Complete 5-section config (Advanced + export/import) |
| v1.6 | ✅ Complete | Advanced section with API timeout + max context |
| v1.5 | ✅ Complete | Personas section improvements |

**Key Files:**
- `module-loader.js` line 225, 227 - Controls which versions load (chat v1.4.4 + config v1.7)
- `modules/chat/chat-v1.4.4.js` - **ENHANCED localStorage** with cross-domain fallback patterns
- `modules/config/config-v1.7.js` - Complete 5-section configuration with Advanced features
- `styles.css` line 362 - Module container background (now black for clean UX)
- `index.html` - Navigation and container
- `version_update.md` - Complete version history and documentation

## Bob AI Platform - Modular UI Container System

This is a professional construction management dashboard built as a modular UI container system. The architecture transforms a monolithic HTML implementation into a scalable, maintainable system with dynamic ES6 module loading.

## Development Commands

### Running the Application
```bash
# Open the application (no build process required)
start index.html  # Windows
open index.html   # macOS
python -m http.server 8080  # Local server (recommended for development)
```

### Development Server
The application is designed to run as static files but works best with a local HTTP server for ES6 module loading:
```bash
# Start local development server
python -m http.server 8080
# Navigate to http://localhost:8080
```

### Module Development
```bash
# Test specific module loading
# Open browser console and use debug utilities:
window.bobAiDebug.loadModule('module-name')
window.bobAiDebug.clearCache()  # Clear module cache during development
```

## 📸 Preferred Development Workflow (Screenshot-Driven)

**Process:**
1. **User screenshots issue** → Places in `/Images/` folder  
2. **AI analyzes visually** → Confirms understanding of the change needed
3. **User authorizes specific changes** → "Yes, proceed with items 1-3"
4. **AI implements step-by-step** → With TodoWrite progress tracking
5. **Version increment** → Copy → Update module-loader.js → Document changes

**Example Workflow:**
- User: "I dropped a new image in the images folder"
- AI: "I see you want to [describes change]. Should I proceed with: 1) Copy v1.3.1.6 → v1.3.1.7, 2) Make the change, 3) Update version docs?"
- User: "Yes"
- AI: Implements with progress tracking

## Development Workflow

## Version Management Protocol

### Making Changes to Chat Module
1. **Copy stable version first**: `cp chat-v1.3.1.6.js chat-v1.3.1.7.js`
2. **Update module-loader.js line 225**: Change version number to new version
3. **Make focused changes**: One clear improvement per version
4. **Test thoroughly**: Refresh browser (cache busting via timestamps)
5. **Document in version_update.md**: Add comprehensive change documentation
6. **Update CLAUDE.md status**: Reflect new stable version

### Critical DOM Element Safety
**Before removing any UI elements:**
- **Search for getElementById references**: `grep -n "getElementById('elementId')" *.js`
- **Add null checks**: `const btn = document.getElementById('btn'); if (btn) { btn.disabled = false; }`
- **Consider hidden DOM strategy**: Use `style="display: none;"` to preserve functionality
- **Test functionality**: Ensure all features still work after UI changes

### Creating New Modules
1. Create directory in `modules/`
2. Create module file following the class pattern
3. Add navigation entry in `index.html`
4. Test loading via `window.bobAiDebug.loadModule('module-name')`

### Debugging
Use browser dev tools console:
```javascript
// Available debug utilities on localhost
window.bobAiDebug.getState()
window.bobAiDebug.clearCache()
window.bobAiDebug.loadModule('chat')
```

## Important Implementation Details

### Message History System
Chat module includes `ChatHistoryManager` class for localStorage persistence:
- Saves messages to localStorage with project/session keys
- Restores chat history when loading existing projects
- Two message formats: `.message` (simple bubbles) and `.chat-message` (enhanced with avatars)

### Responsive Design
CSS includes mobile-first responsive design:
- Desktop: > 1024px
- Tablet: 768px - 1024px  
- Mobile: < 768px

### Error Handling
- Graceful module loading fallbacks
- Console logging for debugging
- User-friendly error messages
- Module cache clearing for development

### Performance Considerations
- Module caching prevents re-downloads
- Lazy loading reduces initial page load
- CSS variables for efficient styling
- Timestamp-based cache busting in development

---

## 📚 Detailed Architecture Reference

### Module Loading System
The application uses a custom ES6 module loader (`module-loader.js`) that:
- Dynamically loads modules on navigation click
- Caches modules for performance
- Manages shared state between modules
- Handles graceful fallbacks for missing modules

Key file: `module-loader.js` - controls all module loading and state management.

### Module Structure
Each module follows this pattern:
```
modules/
├── module-name/
│   └── module-name.js  # Main module file
```

Active modules:
- `chat/` - AI assistant interface (current stable: v1.3.1.6)
- `dashboard/` - Project overview and metrics
- `documents/` - Document management  
- `config/` - Configuration panel (v1.0, ready for v1.4 integration)

### Module Communication
Modules communicate through shared state:
```javascript
// Get state
const state = this.moduleLoader.getState();

// Update state
this.moduleLoader.setState({
    currentProject: 'Project Name',
    projectId: 'proj_123',
    sessionId: 'session_456'
});
```

### Chat Module Integration
The chat module integrates with n8n webhooks for backend functionality:
```javascript
this.endpoints = {
    setup: 'https://n8n.srv997771.hstgr.cloud/webhook/...',
    listProjects: 'https://n8n.srv997771.hstgr.cloud/webhook/...',
    // ... other endpoints
};
```

### Clean Interface Achievement (v1.3.1.6)
Current implementation features:
- **No visible blue header** - Clean, minimal interface
- **Hidden DOM elements** - Essential elements preserved invisibly for functionality
- **Full functionality maintained** - Chat history, project switching, all actions work
- **Dynamic version display** - Bold version number in footer for testing confirmation
- **Error-free operation** - No duplicate error messages

### Navigation System
Navigation is defined in `index.html` with `data-module` attributes:
```html
<div class="nav-item dropdown" data-module="chat">
    <button class="nav-button">AI Assistant</button>
    <!-- dropdown items -->
</div>
```

### AI Assistant Dropdown Integration
The chat module v1.4.2 includes complete dropdown functionality:
- "Chat Interface" - loads chat module
- "Commit to Memory" - functional memory commit with validation
- "Clear History" - clears chat with confirmation dialog
- "Switch Project" - switches projects with unsaved work warning

### Configuration System (Bite #4 - COMPLETE ✅)
Config module v1.3 implements full slide-out configuration panel:
- **Model Selection**: 4 AI model types (Default, Vision, Code, Strategy) with localStorage persistence
- **Database Branch**: Production vs Testing branch selection for n8n workflows
- **Features**: User preference toggles for behavior control (commit toasts, auto-vision)
- **Overlay Architecture**: Slides in from right without disturbing chat content
- **Seamless UX**: Chat conversation stays visible, no content clearing/reloading
- **Smart Integration**: Feeds into chat module for intelligent AI routing

**Key Achievement**: Configuration never disrupts chat experience - true overlay behavior

### Features Module (Bite #4 - COMPLETE ✅)
Feature toggles provide user control over behavior:
- **Show commit notification toasts**: Controls popup notifications for memory commits
- **Automatically use vision model for images**: Controls auto-switching to vision model when images detected
- **localStorage persistence**: Settings saved and restored between sessions
- **Immediate feedback**: Changes take effect instantly without page reload

### Systematic Issue Resolution Pattern
**When debugging problems:**
1. **Compare working vs broken versions** - Always check last known stable version
2. **Search for specific error patterns** - Use `Grep` tool for error messages in code
3. **Trace execution flow** - Follow method calls and event handlers systematically  
4. **Test isolation** - Remove suspected elements to confirm root cause
5. **Add null safety** - Ensure all DOM access has proper null checks

### File Structure Patterns

#### Static Assets
- `index.html` - Main container shell with navigation
- `styles.css` - Global styling and responsive design
- `assets/` - Images and static resources

#### Module Files
- Each module exports a default class
- Must implement: `init()`, `render()`, `postRender()`, `cleanup()`
- Optional: `onStateChange()` for state updates

#### Version Control
- `version_update.md` - Comprehensive version history
- `session_status.md` - Current development status
- Version numbers in module filenames (e.g., `chat-v1.3.1.4.js`)