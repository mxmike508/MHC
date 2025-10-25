/**
 * CHAT MODULE v1.6.4 - Bob AI Platform Main Interface
 * AUTO-COMMIT MEMORY MANAGEMENT + MULTI-DEVICE SYNC + EDITABLE PROJECT INFO
 *
 * Based on stable v1.5.0 foundation with:
 * - Platform-agnostic chat persistence (localStorage + database backend)
 * - Persona assignment system with per-project persistence
 * - Config integration (model selection, database branch, features)
 * - Complete Chat v10.4 compatibility (image handling, payload structure)
 *
 * NEW v1.6.0: Auto-Commit Memory Management
 * - Automatic conversation commit to RAG store based on configurable thresholds
 * - Message counter tracking (default: auto-commit every 50 messages)
 * - Session-end auto-commit on project switch
 * - Visual progress indicator in chat header
 * - Configurable via Config v1.8 Memory Management section
 *
 * PATCH v1.6.1: Counter Persistence Bug Fix
 * - Counter now initializes based on loaded message count from backend/localStorage
 * - Preserves uncommitted message count across session reloads
 * - Platform-agnostic: Uses backend conversation_history count (no localStorage dependency)
 *
 * PATCH v1.6.2: Close Session + Multi-Device Counter Sync
 * - NEW: "Close Session" button in AI Assistant dropdown
 * - Explicit session close with auto-commit (no need to switch projects)
 * - Page Visibility API: Auto-refreshes counter when tab regains focus
 * - Solves multi-device/multi-tab stale counter problem
 * - Console logging: "🔄 Counter refreshed: X → Y (backend sync)"
 *
 * PATCH v1.6.3: Counter Visibility Fix
 * - BUGFIX: Counter now displays based ONLY on "Show commit progress" setting
 * - Counter visible even when auto-commit disabled (was incorrectly hidden before)
 * - Decoupled counter display from auto-commit feature enable toggle
 *
 * PATCH v1.6.4: Editable Project Info
 * - NEW: Click project name in header to edit name and description
 * - Modal dialog for editing project metadata
 * - Updates project_contexts table via n8n endpoint
 * - Real-time header update after save
 * - Preserves immutable keys (chat_session_id, rag_session_id, persona)
 */

/**
 * ChatHistoryManager - Handles localStorage persistence for chat conversations
 * Phase 1: localStorage only
 * Phase 2 Ready: Can easily add backend sync methods
 */
class ChatHistoryManager {
    constructor(projectId, chatId) {
        this.projectId = projectId;
        this.chatId = chatId;
        this.storageKey = `bobai_chat_${projectId}_${chatId}`;
        this.maxMessages = 1000; // Prevent localStorage from getting too large
    }

    /**
     * Save a single message to localStorage with cross-domain backup
     */
    saveMessage(sender, message, timestamp = null, isHtml = false) {
        try {
            const messageData = {
                sender,
                message,
                timestamp: timestamp || new Date().toISOString(),
                isHtml,
                id: Date.now() + Math.random() // Unique message ID
            };

            // Get existing history
            const history = this.loadHistory();
            
            // Add new message
            history.push(messageData);
            
            // Trim if too many messages (keep most recent)
            if (history.length > this.maxMessages) {
                history.splice(0, history.length - this.maxMessages);
            }

            const historyJson = JSON.stringify(history);

            // Save to primary storage key
            localStorage.setItem(this.storageKey, historyJson);
            
            // Also save to domain-specific backup key for cross-domain compatibility
            const currentDomain = window.location.hostname;
            const domainKey = currentDomain.includes('github.io') 
                ? `bobai_chat_github_${this.projectId}_${this.chatId}`
                : currentDomain.includes('localhost') 
                ? `bobai_chat_localhost_${this.projectId}_${this.chatId}`
                : `bobai_chat_default_${this.projectId}_${this.chatId}`;
            
            try {
                localStorage.setItem(domainKey, historyJson);
                console.log(`📚 Message saved to both primary (${this.storageKey}) and domain backup (${domainKey})`);
            } catch (backupError) {
                console.warn('Failed to save backup copy to domain-specific key:', backupError);
            }
            
            console.log(`📚 Message saved to history: ${sender}`, messageData);
            return messageData;
        } catch (error) {
            console.warn('Failed to save message to localStorage:', error);
            return null;
        }
    }

    /**
     * Load complete chat history from localStorage with cross-domain fallback
     */
    loadHistory() {
        try {
            // Try primary storage key first
            let stored = localStorage.getItem(this.storageKey);
            let fallbackAttempted = '';
            
            // If no data found, try fallback patterns for cross-domain compatibility
            if (!stored) {
                // Generate fallback storage keys for different domain patterns
                const fallbackKeys = [
                    `bobai_chat_${this.projectId}_${this.chatId}`, // Original pattern
                    `bobai_chat_localhost_${this.projectId}_${this.chatId}`, // Localhost specific
                    `bobai_chat_github_${this.projectId}_${this.chatId}`, // GitHub specific
                    `bobai_chat_default_${this.projectId}_${this.chatId}`, // Default fallback
                    `chat_${this.projectId}_${this.chatId}`, // Simplified pattern
                    `bobai_${this.projectId}_${this.chatId}` // Basic pattern
                ];
                
                // Try each fallback key
                for (const key of fallbackKeys) {
                    if (key !== this.storageKey) { // Skip if same as primary
                        stored = localStorage.getItem(key);
                        if (stored) {
                            fallbackAttempted = key;
                            console.log(`📖 Found chat history using fallback key: ${key}`);
                            break;
                        }
                    }
                }
            }
            
            if (stored) {
                const history = JSON.parse(stored);
                const messageCount = Array.isArray(history) ? history.length : 0;
                
                if (fallbackAttempted) {
                    console.log(`📖 Loaded ${messageCount} messages from fallback storage: ${fallbackAttempted}`);
                    // Migrate data to primary key for future use
                    if (messageCount > 0) {
                        try {
                            localStorage.setItem(this.storageKey, stored);
                            console.log(`🔄 Migrated chat history to primary key: ${this.storageKey}`);
                        } catch (migrateError) {
                            console.warn('Failed to migrate chat history to primary key:', migrateError);
                        }
                    }
                } else {
                    console.log(`📖 Loaded ${messageCount} messages from primary storage: ${this.storageKey}`);
                }
                
                return Array.isArray(history) ? history : [];
            }
            
            // If still no data, check if we're on a different domain and log helpful info
            const currentDomain = window.location.hostname;
            console.log(`📝 No chat history found for project ${this.projectId}, chat ${this.chatId} on domain: ${currentDomain}`);
            console.log(`🔍 Searched storage keys: ${this.storageKey} + ${fallbackKeys.length} fallback patterns`);
            
        } catch (error) {
            console.warn('Failed to load chat history from localStorage:', error);
        }
        return [];
    }

    /**
     * Clear chat history for this project/chat
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log(`🗑️ Cleared chat history for ${this.storageKey}`);
            return true;
        } catch (error) {
            console.warn('Failed to clear chat history:', error);
            return false;
        }
    }

    /**
     * Get storage info for debugging
     */
    getStorageInfo() {
        const history = this.loadHistory();
        const storageSize = localStorage.getItem(this.storageKey)?.length || 0;
        return {
            storageKey: this.storageKey,
            messageCount: history.length,
            storageSize: `${(storageSize / 1024).toFixed(2)}KB`,
            oldestMessage: history[0]?.timestamp,
            newestMessage: history[history.length - 1]?.timestamp
        };
    }

    // Phase 2 Ready: These methods can be added later for backend sync
    // async syncToBackend() { ... }
    // async loadFromBackend() { ... }
    // async mergeHistories() { ... }
}

class ChatModule {
    constructor(sharedState, moduleLoader) {
        console.log('🚀 ChatModule v1.5.0 initializing...');
        console.log('✅ Features: Persona assignment, enhanced image display, Google Storage URL handling, localStorage history');
        this.sharedState = sharedState;
        this.moduleLoader = moduleLoader;
        this.id = 'chat';
        
        // n8n Backend URLs (from Chat_v10.4.html)
        this.endpoints = {
            setup: 'https://n8n.srv997771.hstgr.cloud/webhook/d0b91f11-487b-441f-80a3-17edd5a703db',
            listProjects: 'https://n8n.srv997771.hstgr.cloud/webhook/a61a290c-d8e5-4c04-980a-4ebb415a21e4',
            ragIndexing: 'https://n8n.srv997771.hstgr.cloud/webhook/303639ed-a3e2-4eae-b406-16e1c6200a81',
            chat: 'https://n8n.srv997771.hstgr.cloud/webhook/3c92075f-a856-439a-b70d-73f3c847f8fa',
            commitMemory: 'https://n8n.srv997771.hstgr.cloud/webhook/6c1ce608-2f7a-457b-9afc-f0be5ef4bd4c',
            imageHandler: 'https://n8n.srv997771.hstgr.cloud/webhook/e09ef7c8-656d-49fb-a84a-2bc21f6c377d',
            documentHandler: 'https://n8n.srv997771.hstgr.cloud/webhook/0f0b56ad-64e2-4008-9108-eb247c85787c',
            loadHistory: 'https://n8n.srv997771.hstgr.cloud/webhook/load-conversation-history',
            updateProjectInfo: 'https://n8n.srv997771.hstgr.cloud/webhook/update-project-info'
        };
        
        // Chat state
        this.currentProjectId = null;
        this.currentChatId = null;
        this.currentRagId = null;
        this.currentProjectDescription = null; // Store project description
        this.currentProjectPersona = null; // Store current persona key
        this.sessions = {};
        this.isSending = false;
        this.requestSeq = 0;
        this.librariesLoaded = false; // Track markdown library loading
        
        // NEW v1.2: Chat history manager
        this.historyManager = null;

        // NEW v1.6.0: Auto-commit tracking
        this.messagesSinceLastCommit = 0;
        this.lastCommitTimestamp = Date.now();

        // Image handling state (Chat v10.4 compatible)
        this.currentImageData = null; // base64 fallback
        this.currentImageUrl = null;  // preferred URL from handler
        
        // UI elements (will be set in postRender)
        this.chatWindow = null;
        this.chatInput = null;
        this.sendButton = null;
        this.sessionSelect = null;
    }

    // Default personas (fallback if config module unavailable)
    getDefaultPersonas() {
        return [
            {
                key: 'dev_assistant',
                label: 'Developer Assistant',
                content: 'You are a concise developer assistant. Return the smallest correct answer. Prefer code-only when obvious. No flourish. For procedural instructions, use numbered lists by default.',
                active: true
            },
            {
                key: 'biz_analyst',
                label: 'Business Analyst',
                content: 'You are a concise business analyst. Answer in brief bullets. No fluff. Use the user\'s terms. For step-by-step processes, use numbered lists by default.',
                active: true
            },
            {
                key: 'facts_extractor',
                label: 'Facts Extractor',
                content: 'You extract terse facts. Only verifiable statements. Respond minimally. For procedural content, default to numbered lists.',
                active: true
            }
        ];
    }

    // Get personas from config module or fallback to defaults
    getPersonasFromConfig() {
        if (this.configModule && typeof this.configModule.getAllPersonas === 'function') {
            try {
                const personas = this.configModule.getAllPersonas();
                console.log('✅ Chat v1.5.0: Loaded', personas.length, 'personas from config module');
                return personas;
            } catch (error) {
                console.warn('⚠️ Chat v1.5.0: Failed to get personas from config module:', error);
            }
        }
        console.log('ℹ️ Chat v1.5.0: Using fallback default personas');
        return this.getDefaultPersonas();
    }

    // Populate persona dropdown with available personas
    populatePersonaDropdown() {
        const select = document.getElementById('personaSelect');
        if (!select) {
            console.warn('⚠️ Chat v1.5.0: Persona dropdown not found in DOM');
            return;
        }

        const personas = this.getPersonasFromConfig();
        select.innerHTML = ''; // Clear loading message

        personas.forEach((persona, index) => {
            const option = document.createElement('option');
            option.value = persona.key;
            option.textContent = persona.label;
            if (index === 0) option.selected = true; // Select first by default
            select.appendChild(option);
        });

        console.log('✅ Chat v1.5.0: Populated persona dropdown with', personas.length, 'options');
    }

    // Save persona choice for a specific project
    saveProjectPersona(projectId, personaKey) {
        if (!projectId || !personaKey) return;
        try {
            const map = JSON.parse(localStorage.getItem('project_personas') || '{}');
            map[projectId] = personaKey;
            localStorage.setItem('project_personas', JSON.stringify(map));
            console.log('✅ Chat v1.5.0: Saved persona for project:', projectId, '→', personaKey);
        } catch (error) {
            console.warn('⚠️ Chat v1.5.0: Failed to save project persona:', error);
        }
    }

    // Load persona choice for a specific project
    loadProjectPersona(projectId) {
        try {
            const map = JSON.parse(localStorage.getItem('project_personas') || '{}');
            const personaKey = map[projectId] || null;
            if (personaKey) {
                console.log('✅ Chat v1.5.0: Loaded persona for project:', projectId, '→', personaKey);
            }
            return personaKey;
        } catch (error) {
            console.warn('⚠️ Chat v1.5.0: Failed to load project persona:', error);
            return null;
        }
    }

    // Get persona content (system prompt) from persona key
    getPersonaContent(personaKey) {
        if (!personaKey) return null;
        const personas = this.getPersonasFromConfig();
        const persona = personas.find(p => p.key === personaKey);
        return persona ? persona.content : null;
    }

    // Get persona label (display name) from persona key
    getPersonaLabel(personaKey) {
        if (!personaKey) return 'None';
        const personas = this.getPersonasFromConfig();
        const persona = personas.find(p => p.key === personaKey);
        return persona ? persona.label : personaKey;
    }

    async init(subModule = null) {
        console.log('Chat module v1.3.1.3 initialized with functional AI Assistant dropdown');
        this.subModule = subModule;
        
        // Load dependencies
        await this.loadDependencies();
        
        // Restore session state
        this.restoreSessionState();
    }

    async loadDependencies() {
        console.log('🔧 Loading markdown dependencies...');
        
        // Load marked for markdown processing
        if (!window.marked) {
            console.log('📚 Loading marked.js...');
            const markedScript = document.createElement('script');
            markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            document.head.appendChild(markedScript);
            
            await new Promise((resolve, reject) => {
                markedScript.onload = () => {
                    console.log('✅ marked.js loaded successfully');
                    resolve();
                };
                markedScript.onerror = () => {
                    console.error('❌ Failed to load marked.js');
                    reject(new Error('Failed to load marked.js'));
                };
            });
        } else {
            console.log('✅ marked.js already available');
        }
        
        // Load DOMPurify for HTML sanitization
        if (!window.DOMPurify) {
            console.log('🧹 Loading DOMPurify...');
            const dompurifyScript = document.createElement('script');
            dompurifyScript.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.min.js';
            document.head.appendChild(dompurifyScript);
            
            await new Promise((resolve, reject) => {
                dompurifyScript.onload = () => {
                    console.log('✅ DOMPurify loaded successfully');
                    resolve();
                };
                dompurifyScript.onerror = () => {
                    console.error('❌ Failed to load DOMPurify');
                    reject(new Error('Failed to load DOMPurify'));
                };
            });
        } else {
            console.log('✅ DOMPurify already available');
        }
        
        console.log('🎉 All markdown dependencies loaded!');
        this.librariesLoaded = true;
    }

    /**
     * NEW v1.2: Initialize or update chat history manager
     */
    initializeHistoryManager() {
        if (this.currentProjectId && this.currentChatId) {
            this.historyManager = new ChatHistoryManager(this.currentProjectId, this.currentChatId);
            console.log('📚 Chat history manager initialized:', this.historyManager.getStorageInfo());
        } else {
            this.historyManager = null;
            console.log('📚 Chat history manager cleared (no active project)');
        }
    }

    /**
     * NEW v1.2: Restore chat history - tries backend first, falls back to localStorage
     * Platform-agnostic: Works across devices by loading from database
     */
    async restoreChatHistory() {
        if (!this.historyManager || !this.chatWindow) return;

        // Try loading from backend first (platform-agnostic)
        if (this.currentChatId) {
            const loadedCount = await this.loadConversationHistoryFromBackend(this.currentChatId);
            if (loadedCount > 0) {
                console.log('✅ Chat history restored from backend database');

                // NEW v1.6.1: Set counter based on loaded messages
                this.messagesSinceLastCommit = loadedCount;
                this.updateCommitProgressIndicator();
                console.log(`🧠 Counter initialized to ${loadedCount} uncommitted messages from backend`);

                return; // Successfully loaded from backend, we're done
            }
        }

        // Fallback to localStorage if backend load failed or returned no data
        console.log('📖 Falling back to localStorage for chat history');

        const history = this.historyManager.loadHistory();
        if (history.length === 0) {
            console.log('📖 No chat history to restore');
            return;
        }

        console.log(`📖 Restoring ${history.length} messages from localStorage`);

        // Clear current chat window (except welcome message)
        this.clearChatWindow(false);

        // Restore each message
        history.forEach(messageData => {
            this.addMessageToUI(messageData.sender, messageData.message, messageData.isHtml, false); // false = don't save to history again
        });

        // Hide welcome message if there are restored messages
        const welcome = document.getElementById('chatWelcome');
        if (welcome && history.length > 0) {
            welcome.style.display = 'none';
        }

        // Scroll to bottom to show most recent messages
        if (this.chatWindow) {
            this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        }

        // NEW v1.6.1: Set counter based on loaded messages from localStorage
        this.messagesSinceLastCommit = history.length;
        this.updateCommitProgressIndicator();
        console.log(`🧠 Counter initialized to ${history.length} uncommitted messages from localStorage`);

        console.log('✅ Chat history restored from localStorage');
    }

    /**
     * NEW: Load conversation history from backend database
     * Platform-agnostic persistence - works across devices
     * Returns: Number of messages loaded (0 if failed or empty)
     */
    async loadConversationHistoryFromBackend(sessionId) {
        if (!sessionId) {
            console.log('⚠️ No session ID provided for backend history loading');
            return 0;
        }

        try {
            const maxContext = parseInt(localStorage.getItem('cfg_max_context') || '100');
            console.log(`🔄 Loading conversation history from backend for session: ${sessionId} (max: ${maxContext})`);

            const response = await this.fetchWithTimeout(this.endpoints.loadHistory, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_session_id: sessionId,  // Per Master Data Contract: UI sends chat_session_id
                    max_context: maxContext
                })
            });

            if (!response.ok) {
                console.warn(`⚠️ Backend history load failed: ${response.status} ${response.statusText}`);
                return 0;
            }

            const result = await response.json();

            if (!result.success || !result.messages) {
                console.warn('⚠️ Backend returned unsuccessful or empty result');
                return 0;
            }

            console.log(`✅ Loaded ${result.count} messages from backend database`);

            // If we got messages from backend, populate localStorage and display
            if (result.messages.length > 0) {
                // Clear current chat window
                this.clearChatWindow(false);

                // Process each message
                result.messages.forEach(msg => {
                    // Determine sender based on role
                    const sender = msg.role === 'user' ? 'user' : 'ai';

                    // Add to UI (with saveToHistory = true to populate localStorage cache)
                    this.addMessageToUI(sender, msg.content, false, true);
                });

                // Hide welcome message
                const welcome = document.getElementById('chatWelcome');
                if (welcome) {
                    welcome.style.display = 'none';
                }

                // Scroll to bottom
                if (this.chatWindow) {
                    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
                }

                console.log('✅ Backend history loaded and displayed, localStorage cache updated');
                return result.messages.length; // NEW v1.6.1: Return count for counter initialization
            } else {
                console.log('📖 No messages found in backend for this session');
                return 0;
            }

        } catch (error) {
            console.error('❌ Failed to load history from backend:', error);
            return 0;
        }
    }

    /**
     * NEW v1.2: Clear chat window (with option to preserve welcome message)
     */
    clearChatWindow(showWelcome = true) {
        if (!this.chatWindow) return;

        if (showWelcome) {
            // Reset to welcome message
            this.chatWindow.innerHTML = '<div class="welcome-message" id="chatWelcome"><div class="welcome-content"><h3>🎯 Ready to assist with your construction project!</h3><p>I can help you with project planning, document analysis, workflow optimization, and more.</p><div class="quick-tips"><div class="tip-item">📄 <strong>Upload documents</strong> for instant analysis</div><div class="tip-item">💬 <strong>Ask questions</strong> about your project</div><div class="tip-item">📊 <strong>Generate reports</strong> and insights</div><div class="tip-item">🔄 <strong>Automate workflows</strong> and processes</div></div></div></div>';
        } else {
            // Clear everything
            this.chatWindow.innerHTML = '';
        }
    }

    render() {
        return `
            <div class="chat-main-container">
                <!-- Project Launcher Section -->
                <div class="project-launcher" id="projectLauncher" style="display: ${!this.currentProjectId ? 'flex' : 'none'};">
                    <div class="launcher-content">
                        <div class="launcher-header">
                            <h1>🤖 Welcome to Bob AI Assistant</h1>
                            <p>Your intelligent construction management companion</p>
                        </div>
                        
                        <div class="launcher-options">
                            <div class="launcher-card" id="newProjectCard">
                                <div class="card-icon">➕</div>
                                <h3>Start New Project</h3>
                                <p>Create a fresh project workspace with AI assistance</p>
                                <div class="card-features">
                                    <span>• Project planning</span>
                                    <span>• Document analysis</span>
                                    <span>• Workflow automation</span>
                                </div>
                            </div>
                            
                            <div class="launcher-card" id="existingProjectCard">
                                <div class="card-icon">📋</div>
                                <h3>Continue Existing Project</h3>
                                <p>Access your saved projects and continue where you left off</p>
                                <div class="card-features">
                                    <span>• Resume conversations</span>
                                    <span>• Access project history</span>
                                    <span>• Synchronized state</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Existing Projects Selector -->
                        <div class="existing-projects" id="existingProjects" style="display: none;">
                            <h3>Select a Project to Continue:</h3>
                            <select id="sessionSelect" class="project-selector">
                                <option value="">Loading projects...</option>
                            </select>
                            <div class="project-actions">
                                <button class="btn-secondary" id="cancelExistingBtn">Cancel</button>
                                <button class="btn-primary" id="continueExistingBtn">Continue</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Chat Interface -->
                <div class="chat-interface" id="chatInterface" style="display: ${this.currentProjectId ? 'flex' : 'none'};">

                    <!-- Hidden elements for chat history functionality -->
                    <div style="display: none;">
                        <h2 id="currentProjectName">Bob AI Chat</h2>
                        <span id="displayProjectId">${this.currentProjectId || 'None'}</span>
                        <span id="displayChatId">${this.currentChatId || 'None'}</span>
                        <span id="displayRagId">${this.currentRagId || 'None'}</span>
                    </div>

                    <!-- NEW v1.6.0: Auto-Commit Progress Indicator -->
                    <div id="autoCommitProgressBar" class="auto-commit-progress" style="display: none;">
                        <div class="progress-info">
                            <span class="progress-label">🧠 Auto-Commit:</span>
                            <span id="autoCommitProgressText" class="progress-text">0/50</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: 0px;"></div>
                        </div>
                    </div>

                    <!-- Chat Content Area (Scrollable) -->
                    <div class="chat-content-area">
                        <!-- Chat Messages Window -->
                        <div class="chat-window" id="chatWindow">
                            <div class="welcome-message" id="chatWelcome">
                                <div class="welcome-content">
                                    <h3>🎯 Ready to assist with your construction project!</h3>
                                    <p>I can help you with project planning, document analysis, workflow optimization, and more.</p>
                                    <div class="quick-tips">
                                        <div class="tip-item">📄 <strong>Upload documents</strong> for instant analysis</div>
                                        <div class="tip-item">💬 <strong>Ask questions</strong> about your project</div>
                                        <div class="tip-item">📊 <strong>Generate reports</strong> and insights</div>
                                        <div class="tip-item">🔄 <strong>Automate workflows</strong> and processes</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Progress Bar for AI Response -->
                        <div id="progressBar" class="progress-bar" style="display: none;">
                            <div id="progressBarLabel" class="progress-label">AI is thinking...</div>
                            <div id="progressBarIndicator" class="progress-indicator"></div>
                        </div>
                    </div>

                    <!-- Fixed Bottom Area -->
                    <div class="chat-bottom-area">
                        <!-- File Management Area -->
                        <div class="file-management" id="fileManagement">
                            <!-- File Upload Area -->
                            <div class="file-upload" id="fileUpload">
                                <button id="uploadFileBtn">📎 Upload File</button>
                                <input type="file" id="fileInput" style="display: none;" multiple 
                                       accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif">
                            </div>
                            
                            <!-- Drag & Drop Area -->
                            <div class="drop-area" id="dropArea">
                                Drop files here or click upload button
                            </div>
                            
                            <!-- File Preview -->
                            <div class="file-preview" id="filePreview"></div>
                        </div>

                        <!-- Chat Input Area -->
                        <div class="chat-input-container">
                            <div class="input-row">
                                <textarea id="chatInput" 
                                          placeholder="Ask me anything about your project, upload documents, or request assistance..." 
                                          rows="3"></textarea>
                                <div class="input-buttons">
                                    <button id="micButton" class="input-btn" title="Voice Input">🎤</button>
                                    <button id="sendButton" class="send-btn">
                                        <span class="send-icon">➤</span>
                                    </button>
                                </div>
                            </div>
                            <div id="recordingStatus" class="recording-status" style="display: none;">
                                🔴 Recording...
                            </div>
                        </div>
                    </div>
                </div>

                <!-- New Project Modal -->
                <div id="newProjectModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Create New Project</h2>
                            <button class="modal-close" id="closeNewProjectModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="newProjectName">Project Name:</label>
                                <input type="text" id="newProjectName" placeholder="Enter project name (e.g., 'Smith Kitchen Renovation')">
                            </div>
                            <div class="form-group">
                                <label for="projectDescription">Project Description (optional):</label>
                                <textarea id="projectDescription" placeholder="Brief description of the project..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="dataUrl">Initial Data URL (optional):</label>
                                <input type="url" id="dataUrl" placeholder="https://example.com/project-data.json">
                                <small>Provide a JSON URL for initial data indexing and RAG setup</small>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="enableRag"> Enable RAG (Retrieval Augmented Generation)
                                </label>
                                <small>Allows AI to reference uploaded documents and project history</small>
                            </div>
                            <div class="form-group">
                                <label for="personaSelect">
                                    <i class="fas fa-user-tie"></i> AI Persona:
                                </label>
                                <select id="personaSelect" class="form-control">
                                    <option value="">Loading personas...</option>
                                </select>
                                <small>Choose the AI assistant personality for this project</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" id="cancelNewProjectBtn">Cancel</button>
                            <button class="btn-primary" id="createNewProjectBtn">Create Project</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                /* v1.2 ENHANCED LAYOUT STYLES (from v1.1) */
                .chat-main-container {
                    height: calc(100vh - 140px);
                    display: flex;
                    flex-direction: column;
                    background: white;
                    padding: 0;
                    margin: 0;
                    overflow: hidden;
                }

                /* Project Launcher Styles - FIXED for small screens */
                .project-launcher {
                    flex: 1;
                    display: flex;
                    align-items: flex-start; /* Changed from center to flex-start */
                    justify-content: center;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
                    padding: 1rem; /* Reduced from 2rem */
                    overflow-y: auto; /* Added scroll capability */
                    min-height: 0; /* Allow shrinking */
                }

                .launcher-content {
                    max-width: 800px;
                    width: 100%;
                    text-align: center;
                    margin-top: 1rem; /* Added top margin for small screens */
                }

                .launcher-header h1 {
                    font-size: 2rem; /* Reduced from 2.5rem */
                    color: #0078d4;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }

                .launcher-header p {
                    font-size: 1rem; /* Reduced from 1.2rem */
                    color: #666;
                    margin-bottom: 2rem; /* Reduced from 3rem */
                }

                .launcher-options {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem; /* Reduced from 2rem */
                    margin-bottom: 1.5rem; /* Reduced from 2rem */
                }

                .launcher-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem; /* Reduced from 2rem */
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    min-height: 180px; /* Set minimum height to prevent too small cards */
                }

                .launcher-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    border-color: #0078d4;
                }

                .card-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    color: #0078d4;
                }

                .launcher-card h3 {
                    font-size: 1.5rem;
                    color: #333;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .launcher-card p {
                    color: #666;
                    margin-bottom: 1.5rem;
                    font-size: 1rem;
                }

                .card-features {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    text-align: left;
                }

                .card-features span {
                    color: #0078d4;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .existing-projects {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem; /* Reduced from 2rem */
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    max-width: 500px;
                    margin: 1rem auto 1rem; /* Changed from 2rem auto 0 */
                    position: relative;
                    max-height: 60vh; /* Limit height to prevent viewport overflow */
                    overflow-y: auto; /* Allow scrolling if content is too tall */
                }

                .existing-projects h3 {
                    margin-bottom: 1rem;
                    color: #333;
                }

                .project-selector {
                    width: 100%;
                    padding: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 1rem;
                    margin-bottom: 1rem;
                }

                .project-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }

                /* ENHANCED CHAT INTERFACE STYLES */
                .chat-interface {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    overflow: hidden;
                    min-height: 0; /* Critical for flex container */
                }

                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.3rem 1rem;
                    background: #0078d4;
                    color: white;
                    border-bottom: 1px solid #005a9e;
                    height: 35px;
                    min-height: 35px;
                    flex-shrink: 0;
                    z-index: 100;
                }

                .project-info h2 {
                    margin: 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .project-meta {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.7rem;
                    opacity: 0.9;
                }

                .chat-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .action-btn {
                    padding: 0.25rem 0.5rem;
                    border: 1px solid rgba(255,255,255,0.3);
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.7rem;
                    transition: all 0.2s ease;
                    height: 24px;
                    display: flex;
                    align-items: center;
                }

                .action-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.2);
                }

                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .action-btn.secondary {
                    background: rgba(255,255,255,0.05);
                }

                /* CRITICAL v1.1/v1.2 FIX: Scrollable Content Area */
                .chat-content-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 0;
                    position: relative;
                }

                .chat-window {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 1rem;
                    background: #fafafa;
                    word-break: break-word;
                    box-sizing: border-box;
                    min-height: 0;
                    scrollbar-width: thin;
                    scrollbar-color: #ccc transparent;
                }

                /* Custom scrollbar for webkit browsers */
                .chat-window::-webkit-scrollbar {
                    width: 8px;
                }

                .chat-window::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chat-window::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 4px;
                }

                .chat-window::-webkit-scrollbar-thumb:hover {
                    background: #999;
                }

                .welcome-message {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    min-height: 200px;
                }

                .welcome-content {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    max-width: 600px;
                    text-align: center;
                }

                .welcome-content h3 {
                    color: #0078d4;
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                }

                .welcome-content p {
                    color: #666;
                    margin-bottom: 1.5rem;
                }

                .quick-tips {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    text-align: left;
                }

                .tip-item {
                    color: #333;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Message Styles */
                .message {
                    max-width: 80%;
                    padding: 0.75rem 1rem;
                    border-radius: 16px;
                    margin: 1rem 0;
                    line-height: 1.4;
                    word-wrap: break-word;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    clear: both;
                    box-sizing: border-box;
                }

                .message.user {
                    background: #e3f2fd;
                    color: #1976d2;
                    float: right;
                    margin-left: auto;
                    border-bottom-right-radius: 4px;
                }

                .message.bot {
                    background: #e8f5e9;
                    color: #388e3c;
                    float: left;
                    margin-right: auto;
                    border-bottom-left-radius: 4px;
                }

                .message.system {
                    background: #fff3e0;
                    color: #f57c00;
                    margin: 0.5rem auto;
                    text-align: center;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    max-width: 90%;
                    float: none;
                }
                
                .message.thinking {
                    opacity: 0.7;
                    font-style: italic;
                }

                .message img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    box-sizing: border-box;
                    margin: 5px 0;
                }

                /* Progress Bar */
                .progress-bar {
                    padding: 0.5rem 1rem;
                    background: #f0f8ff;
                    border-bottom: 1px solid #e0e0e0;
                    flex-shrink: 0;
                }

                .progress-label {
                    color: #1976d2;
                    font-weight: 500;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }

                .progress-indicator {
                    height: 4px;
                    background: #e0e0e0;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .progress-indicator::after {
                    content: '';
                    display: block;
                    height: 100%;
                    background: #1976d2;
                    border-radius: 2px;
                    animation: progress-animation 2s infinite;
                    width: 30%;
                }

                @keyframes progress-animation {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }

                /* NEW v1.6.0: Auto-Commit Progress Indicator */
                .auto-commit-progress {
                    padding: 8px 12px;
                    background: rgba(76, 175, 80, 0.05);
                    border-bottom: 1px solid rgba(76, 175, 80, 0.2);
                    flex-shrink: 0;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                    font-size: 0.85rem;
                }

                .progress-label {
                    color: #4CAF50;
                    font-weight: 500;
                }

                .progress-text {
                    color: #666;
                    font-family: monospace;
                }

                .progress-track {
                    height: 4px;
                    background: rgba(76, 175, 80, 0.15);
                    border-radius: 2px;
                    overflow: hidden;
                    max-width: 150px;
                    margin-left: auto;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #66BB6A);
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }

                /* Notification animations */
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }

                /* CRITICAL v1.1/v1.2 FIX: Fixed Bottom Area */
                .chat-bottom-area {
                    flex-shrink: 0;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                    position: relative;
                }

                /* File Management */
                .file-management {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e0e0e0;
                }

                .file-upload button {
                    padding: 0.5rem 1rem;
                    background: #0078d4;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background 0.2s ease;
                }

                .file-upload button:hover {
                    background: #106ebe;
                }

                .drop-area {
                    flex: 1;
                    border: 2px dashed #ccc;
                    border-radius: 8px;
                    padding: 1rem;
                    text-align: center;
                    color: #666;
                    background: #fafafa;
                    transition: all 0.2s ease;
                }

                .drop-area.dragover {
                    border-color: #0078d4;
                    background: #f0f8ff;
                    color: #1976d2;
                }

                .file-preview {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .file-preview img {
                    max-width: 60px;
                    max-height: 60px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }

                /* Chat Input */
                .chat-input-container {
                    background: white;
                    padding: 1rem;
                    border-top: 1px solid #e0e0e0;
                }

                .input-row {
                    display: flex;
                    gap: 0.5rem;
                    align-items: flex-end;
                }

                #chatInput {
                    flex: 1;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    padding: 0.75rem;
                    font-family: inherit;
                    font-size: 1rem;
                    resize: vertical;
                    min-height: 80px;
                    max-height: 200px;
                }

                #chatInput:focus {
                    outline: none;
                    border-color: #0078d4;
                    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
                }

                .input-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .input-btn {
                    width: 40px;
                    height: 40px;
                    border: 1px solid #ccc;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .input-btn:hover {
                    background: #f5f5f5;
                    border-color: #0078d4;
                }

                .send-btn {
                    width: 40px;
                    height: 80px;
                    background: #0078d4;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .send-btn:hover:not(:disabled) {
                    background: #106ebe;
                }

                .send-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                .send-icon {
                    font-size: 1.2rem;
                    font-weight: bold;
                }

                .recording-status {
                    margin-top: 0.5rem;
                    color: #f44336;
                    font-weight: 500;
                    text-align: center;
                }


                /* Modal Styles */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: white;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .modal-header h2 {
                    margin: 0;
                    color: #333;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #333;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 1rem;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .form-group small {
                    color: #666;
                    font-size: 0.85rem;
                    margin-top: 0.25rem;
                    display: block;
                }

                .form-group input[type="checkbox"] {
                    width: auto;
                    margin-right: 0.5rem;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e0e0e0;
                }

                .btn-primary, .btn-secondary {
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .btn-primary {
                    background: #0078d4;
                    color: white;
                    border: none;
                }

                .btn-primary:hover {
                    background: #106ebe;
                }

                .btn-secondary {
                    background: white;
                    color: #666;
                    border: 1px solid #ccc;
                }

                .btn-secondary:hover {
                    background: #f5f5f5;
                }

                /* Markdown formatting styles */
                .message p {
                    margin: 0.5rem 0;
                    line-height: 1.5;
                }
                
                .message strong,
                .message b {
                    font-weight: bold;
                    color: #333;
                }
                
                .message ul {
                    margin: 0.5rem 0;
                    padding-left: 1.5rem;
                }
                
                .message li {
                    margin: 0.25rem 0;
                    line-height: 1.4;
                }
                
                .message h1,
                .message h2,
                .message h3,
                .message h4,
                .message h5,
                .message h6 {
                    margin: 1rem 0 0.5rem 0;
                    font-weight: bold;
                    color: #333;
                }
                
                .message h3 {
                    font-size: 1.1rem;
                }

                /* Responsive Design - ENHANCED for small screens */
                @media (max-width: 768px) {
                    .launcher-options {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .launcher-card {
                        padding: 1rem;
                        min-height: 140px; /* Smaller on mobile */
                    }
                    
                    .launcher-header h1 {
                        font-size: 1.5rem; /* Even smaller on mobile */
                    }
                    
                    .launcher-header p {
                        font-size: 0.9rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .existing-projects {
                        max-width: 95%;
                        padding: 1rem;
                        margin: 0.5rem auto;
                        max-height: 50vh; /* Smaller height on mobile */
                    }
                    
                    .project-launcher {
                        padding: 0.5rem;
                    }
                    
                    .quick-tips {
                        grid-template-columns: 1fr;
                    }
                    
                    .chat-header {
                        flex-direction: row;
                        gap: 0.5rem;
                        align-items: center;
                        padding: 0.25rem 0.5rem;
                        height: 30px;
                        min-height: 30px;
                    }
                    
                    .project-meta {
                        flex-direction: row;
                        gap: 0.5rem;
                        font-size: 0.6rem;
                    }
                    
                    .chat-actions {
                        justify-content: center;
                    }
                    
                    .file-management {
                        flex-direction: column;
                    }
                    
                    #chatInput {
                        min-height: 60px;
                    }
                }

                /* Extra small screens */
                @media (max-height: 600px) {
                    .project-launcher {
                        padding: 0.25rem;
                    }
                    
                    .launcher-header h1 {
                        font-size: 1.3rem;
                        margin-bottom: 0.25rem;
                    }
                    
                    .launcher-header p {
                        font-size: 0.8rem;
                        margin-bottom: 1rem;
                    }
                    
                    .launcher-card {
                        padding: 0.75rem;
                        min-height: 120px;
                    }
                    
                    .existing-projects {
                        max-height: 40vh;
                        padding: 0.75rem;
                    }
                    
                    .launcher-options {
                        gap: 0.75rem;
                        margin-bottom: 1rem;
                    }
                }
            </style>
        `;
    }

    async postRender() {
        // Get UI element references
        this.chatWindow = document.getElementById('chatWindow');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.sessionSelect = document.getElementById('sessionSelect');

        // Get reference to config module for persona management
        // Access via moduleCache since getModule() doesn't exist
        this.configModule = this.moduleLoader.moduleCache.get('config');
        if (this.configModule) {
            console.log('✅ Chat v1.5.0: Config module reference established');
        } else {
            console.warn('⚠️ Chat v1.5.0: Config module not available, using fallback personas');
        }

        // Populate persona dropdown
        this.populatePersonaDropdown();

        // Set up event listeners
        this.setupEventListeners();
        
        // Add dynamic version display
        this.addVersionDisplay();
        
        // NEW v1.2: Initialize history manager and restore chat history
        this.initializeHistoryManager();
        
        // Load existing sessions if needed
        if (!this.currentProjectId) {
            this.loadSessionsFromStorage();
        } else {
            // Restore chat history if we have an active project
            this.restoreChatHistory();
        }

        // NEW v1.6.2: Set up Page Visibility API for tab focus detection
        this.setupTabVisibilityListener();
    }

    setupEventListeners() {
        // Project launcher cards
        const newProjectCard = document.getElementById('newProjectCard');
        if (newProjectCard) {
            newProjectCard.addEventListener('click', () => this.showNewProjectDialog());
        }
        
        const existingProjectCard = document.getElementById('existingProjectCard');
        if (existingProjectCard) {
            existingProjectCard.addEventListener('click', () => this.showExistingProjects());
        }
        
        // Existing project buttons
        const cancelExistingBtn = document.getElementById('cancelExistingBtn');
        if (cancelExistingBtn) {
            cancelExistingBtn.addEventListener('click', () => this.hideExistingProjects());
        }
        
        const continueExistingBtn = document.getElementById('continueExistingBtn');
        if (continueExistingBtn) {
            continueExistingBtn.addEventListener('click', () => this.selectExistingProject());
        }
        
        // Chat action buttons
        const commitMemoryBtn = document.getElementById('commitMemoryBtn');
        if (commitMemoryBtn) {
            commitMemoryBtn.addEventListener('click', () => this.commitToMemory());
        }
        
        // NEW v1.2: Clear history button
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearChatHistory());
        }
        
        const switchProjectBtn = document.getElementById('switchProjectBtn');
        if (switchProjectBtn) {
            switchProjectBtn.addEventListener('click', () => this.switchProject());
        }
        
        // Send button
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        // Chat input handling
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // New project modal
        const closeNewProjectModal = document.getElementById('closeNewProjectModal');
        if (closeNewProjectModal) {
            closeNewProjectModal.addEventListener('click', () => this.closeNewProjectModal());
        }
        
        const cancelNewProjectBtn = document.getElementById('cancelNewProjectBtn');
        if (cancelNewProjectBtn) {
            cancelNewProjectBtn.addEventListener('click', () => this.closeNewProjectModal());
        }
        
        const createNewProjectBtn = document.getElementById('createNewProjectBtn');
        if (createNewProjectBtn) {
            createNewProjectBtn.addEventListener('click', () => this.createNewProject());
        }

        // File upload handling
        const uploadFileBtn = document.getElementById('uploadFileBtn');
        if (uploadFileBtn) {
            uploadFileBtn.addEventListener('click', () => {
                document.getElementById('fileInput').click();
            });
        }
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Drag and drop
        const dropArea = document.getElementById('dropArea');
        if (dropArea) {
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.classList.add('dragover');
            });
            
            dropArea.addEventListener('dragleave', () => {
                dropArea.classList.remove('dragover');
            });
            
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.classList.remove('dragover');
                this.handleFileUpload(e);
            });
        }
    }

    /**
     * NEW v1.2: Clear chat history for current project
     */
    clearChatHistory() {
        if (!this.historyManager) return;
        
        if (confirm('Are you sure you want to clear the chat history for this project? This cannot be undone.')) {
            this.historyManager.clearHistory();
            this.clearChatWindow(true); // Show welcome message
            console.log('✅ Chat history cleared for current project');
        }
    }

    // Project Management Methods
    showNewProjectDialog() {
        document.getElementById('newProjectModal').style.display = 'flex';
    }

    closeNewProjectModal() {
        document.getElementById('newProjectModal').style.display = 'none';
        document.getElementById('newProjectName').value = '';
        document.getElementById('projectDescription').value = '';
        document.getElementById('dataUrl').value = '';
        document.getElementById('enableRag').checked = false;

        // Reset persona to first option
        const personaSelect = document.getElementById('personaSelect');
        if (personaSelect && personaSelect.options.length > 0) {
            personaSelect.selectedIndex = 0;
        }
    }

    showExistingProjects() {
        document.getElementById('existingProjects').style.display = 'block';
        this.loadExistingProjects();
    }

    hideExistingProjects() {
        document.getElementById('existingProjects').style.display = 'none';
    }

    async loadExistingProjects() {
        try {
            // Use the correct Chat v10.4 implementation: POST with action body
            const response = await this.fetchWithTimeout(this.endpoints.listProjects, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'list_projects'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const projects = data.projects; // Extract projects array from response
                const select = document.getElementById('sessionSelect');
                select.innerHTML = '<option value="">Select a project...</option>';
                
                if (Array.isArray(projects) && projects.length > 0) {
                    projects.forEach(project => {
                        const option = document.createElement('option');
                        option.value = project.project_id;
                        option.textContent = project.project_name || `Project ${project.project_id}`;
                        option.dataset.chatId = project.session_id || project.chat_session_id || '';
                        option.dataset.ragId = project.rag_session_id || '';
                        // NEW v1.6.4: Store description and persona for project loading
                        option.dataset.description = project.description || '';
                        option.dataset.persona = project.persona || '';
                        select.appendChild(option);
                    });
                } else {
                    select.innerHTML = '<option value="">No projects found</option>';
                }
            } else {
                console.error('Failed to load projects:', response.statusText);
                const select = document.getElementById('sessionSelect');
                select.innerHTML = '<option value="">Failed to load projects</option>';
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            const select = document.getElementById('sessionSelect');
            select.innerHTML = '<option value="">Error loading projects</option>';
        }
    }

    selectExistingProject() {
        const select = document.getElementById('sessionSelect');
        const selectedOption = select.selectedOptions[0];

        if (selectedOption && selectedOption.value) {
            this.currentProjectId = selectedOption.value;
            this.currentChatId = selectedOption.dataset.chatId || `chat-${Date.now()}`;
            this.currentRagId = selectedOption.dataset.ragId || null;

            // NEW v1.6.4: Load description and persona from project data
            this.currentProjectDescription = selectedOption.dataset.description || '';
            this.currentProjectPersona = selectedOption.dataset.persona || '';

            // Update module loader state with description
            this.moduleLoader.setState({
                currentProject: selectedOption.textContent,
                projectDescription: this.currentProjectDescription
            });

            // NEW v1.2: Initialize history manager for selected project
            this.initializeHistoryManager();

            this.updateSharedState();
            this.switchToChat(selectedOption.textContent);
        }
    }

    async createNewProject() {
        const name = document.getElementById('newProjectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const dataUrl = document.getElementById('dataUrl').value.trim();
        const enableRag = document.getElementById('enableRag').checked;

        // Get selected persona from dropdown
        const selectedPersona = document.getElementById('personaSelect')?.value || 'dev_assistant';

        if (!name) {
            alert('Please enter a project name');
            return;
        }

        try {
            let endpoint, payload;

            if (dataUrl && enableRag) {
                // Create project with RAG indexing
                endpoint = this.endpoints.ragIndexing;
                const currentBranch = this.getCurrentDatabaseBranch();
                payload = {
                    projectName: name,
                    persona_key: selectedPersona,
                    database_branch: currentBranch,
                    xata_branch: this.getXataBranch(currentBranch),
                    jsonUrl: dataUrl  // Fixed: Changed from data_url to jsonUrl to match n8n workflow expectation
                };
            } else {
                // Create simple project - match Chat v10.4 format exactly
                endpoint = this.endpoints.setup;
                const currentBranch = this.getCurrentDatabaseBranch();
                payload = {
                    projectName: name,                // ✅ Match n8n workflow expectation
                    persona_key: selectedPersona,     // ✅ Required field
                    database_branch: currentBranch,  // ✅ Read from config panel
                    xata_branch: this.getXataBranch(currentBranch)  // ✅ Dynamic mapping
                };
            }

            const response = await this.fetchWithTimeout(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const responseText = await response.text();
                console.error('BACKEND WORKFLOW FAILURE - Raw response:', responseText);
                
                if (responseText.trim() === '') {
                    throw new Error('Backend workflow failed: Empty response indicates n8n workflow terminated unexpectedly. Check n8n execution logs for workflow failure.');
                }
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (jsonError) {
                    throw new Error(`Backend workflow failed: Invalid JSON response. Response: "${responseText}". Error: ${jsonError.message}`);
                }
                
                // Validate required response fields
                if (!result.project_id) {
                    throw new Error('Backend workflow failed: Missing project_id in response');
                }
                
                this.currentProjectId = result.project_id;
                this.currentChatId = result.chat_session_id || result.session_id;
                this.currentRagId = result.rag_session_id || null;
                this.currentProjectDescription = description || null; // Store description
                this.currentProjectPersona = selectedPersona; // Store persona key

                // Save persona choice for this project
                this.saveProjectPersona(this.currentProjectId, selectedPersona);

                console.log('Project created successfully:', {
                    projectId: this.currentProjectId,
                    chatId: this.currentChatId,
                    ragId: this.currentRagId
                });

                // NEW v1.2: Initialize history manager for new project
                this.initializeHistoryManager();

                this.updateSharedState();
                this.closeNewProjectModal();
                this.switchToChat(name);
            } else {
                throw new Error(`Backend API failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project. Please try again.');
        }
    }

    async switchToChat(projectName) {
        document.getElementById('projectLauncher').style.display = 'none';
        document.getElementById('chatInterface').style.display = 'flex';

        document.getElementById('currentProjectName').textContent = projectName;
        // Show friendly name instead of raw ID - hide technical IDs from user view
        document.getElementById('displayProjectId').textContent = projectName || 'Current Project';
        document.getElementById('displayChatId').textContent = 'Active';
        document.getElementById('displayRagId').textContent = this.currentRagId ? 'Enabled' : 'None';

        // Load persona for this project if not already set
        if (!this.currentProjectPersona && this.currentProjectId) {
            this.currentProjectPersona = this.loadProjectPersona(this.currentProjectId);
        }

        // NEW v1.3.1.1: Add project info to header
        this.addProjectInfoToHeader();

        // NEW v1.3.1.2: Replace AI Assistant dropdown items only
        this.replaceAIAssistantDropdownItems();

        // NEW v1.2: Restore chat history when switching to chat (now async - tries backend first)
        await this.restoreChatHistory();
    }

    async switchProject() {
        // NEW v1.6.0: Auto-commit on session end if enabled
        const commitOnSessionEnd = localStorage.getItem('cfg_commit_on_session_end') !== 'false';
        if (commitOnSessionEnd && this.messagesSinceLastCommit > 0 && this.currentRagId) {
            console.log('💾 Session ending - triggering auto-commit...');
            await this.commitToMemoryAuto(true);
        }

        this.currentProjectId = null;
        this.currentChatId = null;
        this.currentRagId = null;

        // NEW v1.6.4: Clear project metadata when switching
        this.currentProjectDescription = null;
        this.currentProjectPersona = null;

        // NEW v1.3.1.1: Remove project info from header
        this.removeProjectInfoFromHeader();

        // NEW v1.3.1.2: Restore original AI Assistant dropdown when switching projects
        this.restoreAIAssistantDropdown();

        // NEW v1.2: Clear history manager when switching projects
        this.historyManager = null;

        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('projectLauncher').style.display = 'flex';

        // Clear chat window
        this.clearChatWindow(true);

        this.updateSharedState();

        // NEW v1.6.4: Reload project list to show any updated names
        await this.loadExistingProjects();
    }

    hasExistingMessages() {
        return this.chatWindow.querySelectorAll('.message').length > 0;
    }

    updateSharedState() {
        this.moduleLoader.setState({
            projectId: this.currentProjectId,
            sessionId: this.currentChatId,
            ragSessionId: this.currentRagId
        });
    }

    // Get current database branch from config panel localStorage  
    getCurrentDatabaseBranch() {
        try {
            const savedBranch = localStorage.getItem('cfg_database_branch') || 'main';
            console.log('🌿 Using database branch:', savedBranch);
            return savedBranch;
        } catch (error) {
            console.warn('⚠️ Failed to load database branch:', error);
            return 'main'; // Safe fallback
        }
    }
    
    // Get Xata branch mapping for n8n workflow
    getXataBranch(databaseBranch) {
        const branchMapping = {
            'main': 'main',
            'testing-archive-aug2025': 'testing-archive-aug2025'
        };
        return branchMapping[databaseBranch] || 'main';
    }

    // Get current selected model from config panel localStorage
    getCurrentSelectedModel(modelType = null) {
        try {
            // If no specific type provided, detect from current context
            if (!modelType) {
                const message = document.getElementById('messageInput')?.value || '';
                const hasImage = !!(this.currentImageUrl || this.getAttachedImageUrl());
                modelType = this.getModelTypeFromContext(message, hasImage);
            }
            
            // Return appropriate model based on detected type
            switch(modelType) {
                case 'vision':
                    const visionModel = localStorage.getItem('cfg_vision_model') || 'gpt-4o';
                    console.log('🔍 Using vision model:', visionModel);
                    return visionModel;
                case 'code':
                    const codeModel = localStorage.getItem('cfg_code_model') || 'claude-4-sonnet';
                    console.log('💻 Using code model:', codeModel);
                    return codeModel;
                case 'strategy':
                    const strategyModel = localStorage.getItem('cfg_strategy_model') || 'claude-4-sonnet';
                    console.log('📊 Using strategy model:', strategyModel);
                    return strategyModel;
                default:
                    const defaultModel = localStorage.getItem('cfg_default_model') || 'claude-4-sonnet';
                    console.log('💬 Using default model:', defaultModel);
                    return defaultModel;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load model selection from config:', error);
            return 'claude-4-sonnet'; // Safe fallback
        }
    }

    // Model type detection (Chat v10.4 compatible)
    getModelTypeFromContext(message, hasImage) {
        // Check if auto-vision is enabled before auto-switching
        const autoVisionEnabled = localStorage.getItem('cfg_vision_auto') !== 'false'; // Default to true
        
        if (hasImage && autoVisionEnabled) {
            return 'vision'; // Auto-switch to vision model
        } else if (hasImage && !autoVisionEnabled) {
            // User has disabled auto-vision, use default model even with images
            console.log('🔍 Vision auto-switch disabled - using default model despite image');
        }
        
        const msgLower = message.toLowerCase();
        
        // Code-related keywords
        if (/\b(code|function|class|python|javascript|typescript|react|css|html|sql|database|api|debug|error|syntax)\b/.test(msgLower)) {
            return 'code';
        }
        
        // Strategic planning keywords  
        if (/\b(strategy|business|plan|roadmap|market|growth|revenue|competition|analysis|framework)\b/.test(msgLower)) {
            return 'strategy';
        }
        
        // Default to general text
        return 'text';
    }

    // Image handling methods (Chat v10.4 compatible)
    getAttachedImageUrl() {
        if (this.currentImageUrl) return this.currentImageUrl;
        try {
            const previewEl = document.getElementById('filePreview');
            const imgEl = previewEl?.querySelector('img');
            if (imgEl && imgEl.src && imgEl.src.startsWith('http')) return imgEl.src;
        } catch {}
        return null;
    }
    
    getAttachedImageData() {
        if (this.currentImageData && this.currentImageData.dataUri) return this.currentImageData;
        try {
            const previewEl = document.getElementById('filePreview');
            const imgEl = previewEl?.querySelector('img');
            if (imgEl && imgEl.src && imgEl.src.startsWith('data:image/')) {
                return { dataUri: imgEl.src, mime: (imgEl.src.split(';')[0] || '').replace('data:','') };
            }
        } catch {}
        return null;
    }
    
    clearSingleImage() {
        this.currentImageData = null;
        this.currentImageUrl = null;
        const previewEl = document.getElementById('filePreview');
        if (previewEl) previewEl.innerHTML = '';
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    }
    
    async uploadImageToHandler(file) {
        try {
            const fd = new FormData();
            fd.append('file', file, file.name);
            // Add metadata like Chat v10.4
            try {
                if (this.currentProjectId) fd.append('project_id', this.currentProjectId);
                if (this.currentChatId) fd.append('chat_session_id', this.currentChatId);
            } catch {}
            
            const response = await this.fetchWithTimeout(this.endpoints.imageHandler, { 
                method: 'POST', 
                body: fd 
            });
            
            if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
            
            const data = await response.json();
            const url = (data && (data.url || data.publicUrl || data.imageUrl || data.fileUrl)) || null;
            return url;
        } catch (error) {
            console.warn('uploadImageToHandler failed, will fallback to inline base64:', error);
            return null;
        }
    }
    
    async setSingleImageFromFile(file) {
        // Validate image file
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }
        
        // Reset any prior state
        this.currentImageUrl = null;
        this.currentImageData = null;
        
        // Show uploading state
        const previewEl = document.getElementById('filePreview');
        if (previewEl) previewEl.innerHTML = '<p>Uploading image…</p>';
        
        // Try to upload to handler first
        let uploadedUrl = null;
        if (this.endpoints.imageHandler) {
            uploadedUrl = await this.uploadImageToHandler(file);
        }
        
        if (uploadedUrl) {
            this.currentImageUrl = uploadedUrl;
            this.renderImagePreview({ url: uploadedUrl, mime: file.type, size: file.size, filename: file.name });
        } else {
            // Fallback: inline data URI
            const dataUri = await this.fileToDataURL(file);
            this.currentImageData = { dataUri, mime: file.type, size: file.size, filename: file.name };
            this.renderImagePreview(this.currentImageData);
        }
    }
    
    fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * NEW v1.3: Enhanced image preview rendering with proper styling
     */
    renderImagePreview(img) {
        const previewEl = document.getElementById('filePreview');
        if (!previewEl) return;
        
        const safeName = (img.filename || 'image').replace(/[<>&]/g, '');
        const src = img.url || img.dataUri;
        const details = `${safeName} · ${img.mime || ''} · ${this.bytesToSize(img.size)}`.trim();
        
        // Create clean preview item with proper styling (200x200 max)
        previewEl.innerHTML = `
            <div class="preview-item" style="display: flex; flex-direction: column; align-items: center; padding: 0.5rem; background: white; border-radius: 8px; border: 1px solid #ddd; max-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <img src="${src}" alt="preview" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" />
                <div class="file-info" style="font-size: 0.8rem; color: #666; text-align: center; margin-bottom: 0.5rem;">${details}</div>
                <button type="button" id="removeImageBtn" style="padding: 0.25rem 0.5rem; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">Remove</button>
            </div>`;
            
        // Set up remove button with hover effect
        const removeBtn = document.getElementById('removeImageBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.clearSingleImage());
            removeBtn.addEventListener('mouseenter', () => {
                removeBtn.style.background = '#c82333';
            });
            removeBtn.addEventListener('mouseleave', () => {
                removeBtn.style.background = '#dc3545';
            });
        }
    }

    /**
     * NEW v1.2: Enhanced addMessage method with history saving
     */
    addMessageToUI(sender, text, isHtml = false, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Hide welcome message on first real message
        const welcome = document.getElementById('chatWelcome');
        if (welcome && (sender === 'user' || sender === 'bot')) {
            welcome.style.display = 'none';
        }
        
        if (isHtml || (window.marked && window.DOMPurify)) {
            let html = text;
            if (window.marked && !isHtml) {
                html = window.marked.parse(text);
            }
            if (window.DOMPurify) {
                html = window.DOMPurify.sanitize(html);
            }
            // Fix image thumbnail display - convert storage URLs to actual images
            html = this.processImageThumbnails(html);
            messageDiv.innerHTML = html;
        } else {
            messageDiv.textContent = text;
        }
        
        this.chatWindow.appendChild(messageDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        
        // NEW v1.2: Save to localStorage history
        if (saveToHistory && this.historyManager) {
            this.historyManager.saveMessage(sender, text, null, isHtml);
        }
        
        // Return element for potential badge attachment (Chat v10.4 compatibility)
        return messageDiv;
    }

    // Keep original addMessage method for backwards compatibility
    addMessage(sender, text, isHtml = false) {
        return this.addMessageToUI(sender, text, isHtml, true);
    }

    // Max Context Messages Helper Function
    getLimitedConversationHistory() {
        // Get max context from localStorage or use 20 message default
        const maxContext = parseInt(localStorage.getItem('cfg_max_context') || '20');
        
        console.log(`🔧 Using max context: ${maxContext} messages`);
        
        // Get full conversation history
        const fullHistory = this.historyManager.loadHistory();
        
        // Limit to most recent messages (keep last N messages)
        const limitedHistory = fullHistory.slice(-maxContext);
        
        console.log(`📝 Conversation context: ${limitedHistory.length}/${fullHistory.length} messages`);
        
        return limitedHistory;
    }

    // API Timeout Helper Function
    async fetchWithTimeout(url, options = {}) {
        // Get timeout from localStorage or use 25 second default
        const timeoutSeconds = localStorage.getItem('cfg_api_timeout') || '25';
        const timeoutMs = parseInt(timeoutSeconds) * 1000;
        
        console.log(`🔧 Using API timeout: ${timeoutSeconds}s (${timeoutMs}ms)`);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Request timed out after ${timeoutSeconds} seconds`);
            }
            throw error;
        }
    }

    // Chat Methods
    async sendMessage(e) {
        if (e) e.preventDefault();
        
        const message = this.chatInput.value.trim();
        const imageUrl = this.getAttachedImageUrl();
        const imageAttachment = imageUrl ? null : this.getAttachedImageData();
        
        // Allow sending if there's either text or an image (URL or inline) - Chat v10.4 logic
        if ((!message && !imageUrl && !imageAttachment) || !this.currentChatId || this.isSending) return;
        
        this.isSending = true;
        this.sendButton.disabled = true;
        this.requestSeq++;
        const currentSeq = this.requestSeq;
        
        // Add user message with image if attached (Chat v10.4 logic)
        try {
            const imgSrc = imageUrl || (imageAttachment && imageAttachment.dataUri);
            if (imgSrc) {
                // CRITICAL FIX: Store the working local image for display purposes
                const workingImageSrc = imgSrc;
                console.log('💾 Storing working image source:', workingImageSrc.substring(0, 50) + '...');
                
                const userMd = (message ? (message + '\n\n') : '') + `![image](${workingImageSrc})`;
                this.addMessage('user', userMd, true); // true for HTML/markdown
            } else {
                if (message) {
                    this.addMessage('user', message);
                }
            }
        } catch {
            if (message) {
                this.addMessage('user', message);
            }
        }
        
        this.chatInput.value = '';
        
        // Clear image after sending
        if (imageUrl || imageAttachment) {
            this.clearSingleImage();
        }
        
        // Add thinking indicator like Chat v10.4
        let thinkingIndicator = this.addMessage('bot', '...', false);
        thinkingIndicator.classList.add('thinking');
        
        // Show progress
        this.showProgress('AI is thinking...');
        
        try {
            // FIXED: Use exact Chat v10.4 payload structure for n8n workflow compatibility
            const payload = {
                chatInput: message,                    // Fixed: was 'message', should be 'chatInput'
                chat_session_id: this.currentChatId,
                project_id: this.currentProjectId,
                rag_session_id: this.currentRagId,
                imageUrl: imageUrl || undefined,      // Added: Image URL from handler
                imageData: imageAttachment || undefined, // Added: Base64 image data fallback
                client_req_id: currentSeq,            // Added: Request ID for deduplication
                database_branch: this.getCurrentDatabaseBranch(),     // Read from config panel
                xata_branch: this.getXataBranch(this.getCurrentDatabaseBranch()),  // Dynamic mapping
                selected_model: this.getCurrentSelectedModel(),    // Read from config panel
                model_type: this.getModelTypeFromContext(message || '', !!(imageUrl || imageAttachment)), // Added: Detect vision model
                system_prompt_content: undefined,     // Will be set below from persona
                document_context: window.uploadedDocumentContext || undefined,
                conversation_history: this.getLimitedConversationHistory()  // Added: Limited conversation context
            };

            // Inject system prompt content from selected persona
            const personaKey = this.loadProjectPersona(this.currentProjectId);
            if (personaKey) {
                payload.system_prompt_content = this.getPersonaContent(personaKey);
                console.log('✅ Chat v1.5.0: Injecting system prompt from persona:', personaKey);
            }
            
            console.log('Sending Chat v10.4 compatible payload:', JSON.stringify(payload, null, 2));
            console.log('🤖 Model Selection Info:');
            console.log('- Selected Model:', payload.selected_model);
            console.log('- Detected Type:', payload.model_type);
            console.log('- Has Image:', !!(imageUrl || imageAttachment));
            console.log('📊 Document Context Debug:', window.uploadedDocumentContext);
            console.log('📊 Document Context in Payload:', payload.document_context);
            
            // FIXED: Add URL parameters like Chat v10.4 for n8n workflow routing
            const chatUrl = this.endpoints.chat + 
                `?_ts=${Date.now()}&chat_session_id=${encodeURIComponent(this.currentChatId||'')}&rag_session_id=${encodeURIComponent(this.currentRagId||'')}`;
            
            console.log('Chat URL with parameters:', chatUrl);
            
            const response = await this.fetchWithTimeout(chatUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'      // Added: Accept header like Chat v10.4
                },
                body: JSON.stringify(payload),
                cache: 'no-store'                     // Added: Cache control like Chat v10.4
            });

            if (currentSeq !== this.requestSeq) return; // Ignore stale responses

            if (response.ok) {
                const data = await response.json();
                console.log('CHAT response JSON:', data);
                
                // FIXED: Use Chat v10.4 compatible response parsing logic
                let reply = undefined;
                if (data && typeof data === 'object') {
                    reply = data.reply
                         ?? data.text
                         ?? data.message
                         ?? data.response  // Keep original for backwards compatibility
                         ?? (Array.isArray(data.choices) && data.choices[0]?.message?.content)
                         ?? (typeof data.output_text === 'string' ? data.output_text : undefined);
                } else if (typeof data === 'string') {
                    reply = data;
                }

                if (!reply) {
                    console.warn('No reply field in response. Raw response:', data);
                    let snapshot = '';
                    try {
                        if (typeof data === 'string') {
                            snapshot = data.slice(0, 400);
                        } else if (data && typeof data === 'object') {
                            snapshot = JSON.stringify(data, null, 2).slice(0, 600);
                        }
                    } catch {}
                    const statusHint = response.status ? ` (HTTP ${response.status})` : '';
                    reply = `[No reply returned from server${statusHint}]` + (snapshot ? `\n\nRaw body:\n${snapshot}` : '');
                }

                // FIXED: Replace thinking indicator in place like Chat v10.4
                try {
                    // CRITICAL FIX: Remove ALL Google Storage URLs from AI responses since they're all broken
                    let cleanedReply = reply;
                    if (typeof reply === 'string') {
                        // Match ANY Google Storage URL in AI responses - they're all broken
                        const allGoogleStoragePattern = /!\[image\]\(https:\/\/storage\.googleapis\.com\/[^)]*\)/gi;
                        const foundStorageUrls = reply.match(allGoogleStoragePattern);
                        
                        if (foundStorageUrls && foundStorageUrls.length > 0) {
                            console.error('🚨 REMOVING ALL Google Storage URLs from AI response:', foundStorageUrls);
                            console.log('💡 All Google Storage URLs are broken - backend sends unsigned URLs');
                            
                            // Replace ALL Google Storage URLs with a clean message  
                            cleanedReply = reply.replace(allGoogleStoragePattern, '*[Image uploaded successfully - visible in your message above]*');
                            
                            console.log('✅ Cleaned AI response - no more broken image URLs');
                        }
                    }
                    
                    // Process image thumbnails before displaying
                    const processedReply = this.processImageThumbnails(cleanedReply);
                    
                    // CRITICAL FIX: Ensure libraries are loaded before processing
                    if (window.marked && window.DOMPurify) {
                        console.log('🎨 Processing markdown with libraries');
                        // CRITICAL FIX: Convert bullet characters to proper markdown
                        let markdownText = processedReply;
                        markdownText = markdownText.replace(/^•\s+/gm, '- ');  // Convert • bullets to - bullets
                        markdownText = markdownText.replace(/\n•\s+/g, '\n- '); // Convert mid-line • bullets to - bullets
                        
                        const html = window.marked.parse(markdownText);
                        const safeHtml = window.DOMPurify.sanitize(html);
                        thinkingIndicator.innerHTML = safeHtml;
                        console.log('✅ Markdown processed successfully');
                    } else {
                        console.error('🚨 CRITICAL: Markdown libraries not available!');
                        console.log('   - marked available:', !!window.marked);
                        console.log('   - DOMPurify available:', !!window.DOMPurify);
                        
                        // Try to load libraries now if they're missing
                        if (!this.librariesLoaded) {
                            console.log('🔄 Attempting emergency library loading...');
                            try {
                                await this.loadDependencies();
                                this.librariesLoaded = true;
                                
                                if (window.marked && window.DOMPurify) {
                                    // CRITICAL FIX: Convert bullet characters to proper markdown
                        let markdownText = processedReply;
                        markdownText = markdownText.replace(/^•\s+/gm, '- ');  // Convert • bullets to - bullets
                        markdownText = markdownText.replace(/\n•\s+/g, '\n- '); // Convert mid-line • bullets to - bullets
                        
                        const html = window.marked.parse(markdownText);
                                    const safeHtml = window.DOMPurify.sanitize(html);
                                    thinkingIndicator.innerHTML = safeHtml;
                                    console.log('✅ Emergency markdown processing successful');
                                } else {
                                    throw new Error('Libraries still not available after loading');
                                }
                            } catch (loadError) {
                                console.error('❌ Emergency library loading failed:', loadError);
                                thinkingIndicator.innerHTML = processedReply; // Fallback to raw text
                            }
                        } else {
                            thinkingIndicator.innerHTML = processedReply; // Fallback to raw text
                        }
                    }
                    thinkingIndicator.classList.remove('thinking');
                    
                    // NEW v1.2: Save bot reply to history (update the existing message in history)
                    if (this.historyManager) {
                        this.historyManager.saveMessage('bot', reply, null, false);
                    }
                    
                } catch (e) {
                    console.error('❌ Error processing reply:', e);
                    thinkingIndicator.textContent = reply;
                    thinkingIndicator.classList.remove('thinking');
                    
                    // Still save to history even if processing failed
                    if (this.historyManager) {
                        this.historyManager.saveMessage('bot', reply, null, false);
                    }
                }
                
                // Enable commit button (if it exists)
                const commitBtn = document.getElementById('commitMemoryBtn');
                if (commitBtn) {
                    commitBtn.disabled = false;
                }

                // NEW v1.6.0: Track message for auto-commit
                this.messagesSinceLastCommit += 2; // User message + bot response
                console.log(`📊 Messages since last commit: ${this.messagesSinceLastCommit}`);

                // Check auto-commit threshold and update progress indicator
                await this.checkAutoCommitThreshold();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = 'Sorry, I encountered an error processing your message. Please try again.';
            this.addMessage('bot', errorMessage);
        } finally {
            this.hideProgress();
            this.isSending = false;
            this.sendButton.disabled = false;
        }
    }

    /**
     * NEW v1.3: Test if an image URL can be loaded
     */
    async testImageUrl(url) {
        return new Promise((resolve) => {
            const testImg = new Image();
            testImg.onload = () => {
                console.log('✅ Image URL test passed:', url);
                resolve(true);
            };
            testImg.onerror = () => {
                console.error('❌ Image URL test failed:', url);
                resolve(false);
            };
            // Set a timeout for the test
            setTimeout(() => {
                console.warn('⏰ Image URL test timeout:', url);
                resolve(false);
            }, 10000); // 10 second timeout
            testImg.src = url;
        });
    }

    /**
     * NEW v1.3: COMPLETELY REWRITTEN - Process image thumbnails properly
     * This fixes the messy Google Storage URL display and implements proper 200x200 thumbnails
     */
    processImageThumbnails(html) {
        console.log('🖼️ v1.3: Processing image thumbnails...');
        
        // FIRST: Clean up text that appears with images in user messages
        // Remove text like "Hey Bob, still testing here can you check out this image that I have attached"
        html = html.replace(/.*?(?:check out|attached|uploaded).*?!\[image\]/gi, '![image]');
        html = html.replace(/.*?(?:here is|here's).*?image.*?!\[image\]/gi, '![image]');
        
        // SECOND: Handle markdown image syntax ![image](url) - this is critical for user uploaded images
        html = html.replace(/!\[image\]\(([^)]+)\)/gi, (match, url) => {
            console.log('🖼️ Found markdown image URL:', url);
            
            // Clean up the URL - remove any encoded characters or extra parameters that might cause issues
            let cleanUrl = url.trim();
            
            // CRITICAL FIX: Don't process data:image URLs - they already work perfectly!
            if (cleanUrl.startsWith('data:image/')) {
                console.log('✅ Data URL image - keeping as-is (already works perfectly)');
                return match; // Keep the original markdown as-is
            }
            
            // CRITICAL FIX: Remove ALL Google Storage URLs - they're all broken!
            if (cleanUrl.includes('storage.googleapis.com')) {
                console.error('🚨 BLOCKING Google Storage URL in message processing:', cleanUrl);
                console.log('💡 URL blocked:', cleanUrl.substring(0, 60) + '...');
                console.log('💡 Replacing with clean message - backend sends unsigned URLs');
                
                // Return a clean message instead of trying to load the broken URL
                return '*[Image reference removed - Google Storage URLs require authentication]*';
            }
            
            
            // Check if URL looks like an image or is from known image storage
            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(cleanUrl) ||
                           /storage\.googleapis\.com/i.test(cleanUrl) ||
                           /s3.*amazonaws/i.test(cleanUrl) ||
                           /cloudfront/i.test(cleanUrl) ||
                           cleanUrl.startsWith('data:image/');
            
            if (!isImage) {
                console.log('⚠️ URL does not appear to be an image:', cleanUrl);
                return match; // Keep non-image markdown as-is
            }
            
            // Create unique ID for this image to track loading
            const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Create proper 200x200 thumbnail with enhanced error handling and retry logic
            const onErrorHandler = `
                console.error('❌ Image failed to load [${imageId}]:', this.src);
                
                // For Google Storage URLs, the issue is often CORS or expired auth
                if (this.src.includes('storage.googleapis.com')) {
                    console.error('🚨 Google Storage URL failed - likely CORS or expired auth');
                    console.error('💡 Suggestion: Check if URL has proper public permissions or refresh auth token');
                }
                
                // Replace with error message that's clickable
                this.parentElement.innerHTML = '<div style="padding:20px;text-align:center;color:#666;font-size:0.85rem;border:1px dashed #ccc;background:#f9f9f9;cursor:pointer;height:160px;display:flex;flex-direction:column;justify-content:center;" onclick="window.open(\\'${cleanUrl}\\', \\'_blank\\')" title="Click to try opening in new tab">🖼️<br/><strong>Image Loading Failed</strong><br/><small style="color:#999;margin-top:8px;">Google Storage URL<br/>Click to try viewing</small></div>';
            `;

            return `
                <div class="image-thumbnail" id="container_${imageId}" style="display: inline-block; margin: 15px 5px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 200px; max-height: 200px; border: 2px solid #e0e0e0; background: #f8f9fa;">
                    <img id="${imageId}"
                         src="${cleanUrl}" 
                         alt="Uploaded Image" 
                         style="width: 200px; height: 200px; object-fit: cover; cursor: pointer; display: block; border: none; margin: 0; opacity: 0.3; transition: opacity 0.5s;" 
                         onclick="window.open('${cleanUrl}', '_blank')"
                         onload="console.log('✅ Image loaded successfully [${imageId}]:', this.src); this.style.opacity='1';"
                         onerror="${onErrorHandler}"
                         title="Click to view full size" />
                </div>`;
        });
        
        // Clean up any existing messy text patterns
        html = html.replace(/(?:Here's|Here is|The)\s+(?:the\s+)?(?:uploaded\s+)?image[^:]*:\s*/gi, '');
        html = html.replace(/Image:\s*/gi, '');
        html = html.replace(/\[Image uploaded[^\]]*\]/gi, '');
        
        // Remove Google Storage authentication parameter garbage
        html = html.replace(/(\?GoogleAccessId=[^&\s<>"']+&Expires=[^&\s<>"']+&Signature=[^&\s<>"']+)/gi, '');
        html = html.replace(/(\?.*?GoogleAccessId[^&\s<>"']*[^&\s<>"']*)/gi, '');
        
        // SECOND: Handle raw URLs that weren't caught by markdown processing
        const imagePatterns = [
            // Google Cloud Storage URLs
            /(https:\/\/storage\.googleapis\.com\/[^\s<>"'\?]+(?:\?[^\s<>"']*)?)/gi,
            // General image URLs (50+ char URLs ending in image extensions)
            /(https:\/\/[^\s<>"']{30,}\.(jpg|jpeg|png|gif|webp|bmp)(?:\?[^\s<>"']*)?)/gi,
            // AWS S3 and similar URLs
            /(https:\/\/[^\s<>"']*(?:amazonaws|s3|cloudfront)[^\s<>"']*\.(jpg|jpeg|png|gif|webp|bmp)(?:\?[^\s<>"']*)?)/gi,
            // Any HTTPS URL that looks like an image (longer URLs)
            /(https:\/\/[^\s<>"']{40,})/gi
        ];
        
        const processedUrls = new Set();
        let processedHtml = html;
        
        imagePatterns.forEach(pattern => {
            processedHtml = processedHtml.replace(pattern, (match, url) => {
                // Skip if already processed, inside HTML tag, or clearly not an image
                if (processedUrls.has(url) || /<[^>]*$/.test(html.substring(0, html.indexOf(url)))) {
                    return match;
                }
                
                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url) ||
                               /storage\.googleapis\.com/i.test(url) ||
                               /s3.*amazonaws/i.test(url) ||
                               /cloudfront/i.test(url);
                
                if (!isImage) {
                    return match;
                }
                
                processedUrls.add(url);
                console.log('🖼️ Processing raw URL:', url);
                
                return `
                    <div class="image-thumbnail" style="display: inline-block; margin: 15px 5px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 200px; max-height: 200px; border: 2px solid #e0e0e0; background: #f8f9fa;">
                        <img src="${url}" 
                             alt="Image" 
                             style="width: 200px; height: 200px; object-fit: cover; cursor: pointer; display: block; border: none; margin: 0;" 
                             onclick="window.open('${url}', '_blank')"
                             onload="console.log('✅ Raw image loaded successfully:', this.src)"
                             onerror="console.error('❌ Raw image failed to load:', this.src); this.parentElement.innerHTML='<div style=\\'padding:20px;text-align:center;color:#999;font-size:0.8rem;\\'>🖼️<br/>Image not available<br/><small>Click to try opening</small></div>'; this.parentElement.onclick=function(){window.open('${url}', '_blank');}"
                             title="Click to view full size" />
                    </div>`;
            });
        });
        
        // Clean up text around processed images
        processedHtml = processedHtml.replace(/(?:Here's|Here is|The|Image:|Here's the)\s*<div class="image-thumbnail"/gi, '<div class="image-thumbnail"');
        processedHtml = processedHtml.replace(/<p[^>]*>\s*<div class="image-thumbnail"/gi, '<div class="image-thumbnail"');
        processedHtml = processedHtml.replace(/<\/div>\s*<\/p>/gi, '</div>');
        
        // Remove any remaining broken image references
        processedHtml = processedHtml.replace(/https:\/\/storage\.googleapis\.com[^\s<>"']*(?:\?[^\s<>"']*)?(?![^<]*<\/)(?!.*<img)/gi, '');
        
        console.log(`🖼️ v1.3: Processed image thumbnails. Total processed:`, processedUrls.size);
        
        return processedHtml;
    }

    showProgress(label) {
        const progressBar = document.getElementById('progressBar');
        const progressLabel = document.getElementById('progressBarLabel');
        if (progressBar && progressLabel) {
            progressLabel.textContent = label;
            progressBar.style.display = 'block';
        }
    }

    hideProgress() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.display = 'none';
        }
    }

    async commitToMemory() {
        if (!this.currentRagId) return;

        try {
            const response = await this.fetchWithTimeout(this.endpoints.commitMemory, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: this.currentProjectId,
                    chat_session_id: this.currentChatId,
                    rag_session_id: this.currentRagId
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.currentRagId = result.rag_session_id || this.currentRagId;
                this.addMessage('system', '✅ Conversation committed to memory successfully');
                const ragDisplay = document.getElementById('displayRagId');
                if (ragDisplay) {
                    ragDisplay.textContent = this.currentRagId;
                }
                const commitBtn = document.getElementById('commitMemoryBtn');
                if (commitBtn) {
                    commitBtn.disabled = true;
                }
                this.updateSharedState();
            } else {
                throw new Error('Failed to commit to memory');
            }
        } catch (error) {
            console.error('Error committing to memory:', error);
            this.addMessage('system', '❌ Failed to commit conversation to memory');
        }
    }

    /**
     * NEW v1.6.0: Auto-commit to memory (silent mode)
     * Used by auto-commit system - no UI messages, just subtle notification
     */
    async commitToMemoryAuto(isSessionEnd = false) {
        if (!this.currentRagId) return false;

        try {
            console.log('🧠 Auto-commit triggered:', isSessionEnd ? 'session end' : 'threshold reached');

            const response = await this.fetchWithTimeout(this.endpoints.commitMemory, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: this.currentProjectId,
                    chat_session_id: this.currentChatId,
                    rag_session_id: this.currentRagId
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.currentRagId = result.rag_session_id || this.currentRagId;

                // Reset counter after successful commit
                this.messagesSinceLastCommit = 0;
                this.lastCommitTimestamp = Date.now();

                // Update UI silently
                const ragDisplay = document.getElementById('displayRagId');
                if (ragDisplay) {
                    ragDisplay.textContent = this.currentRagId;
                }

                // Show subtle notification if enabled
                const showProgress = localStorage.getItem('cfg_show_commit_progress') !== 'false';
                if (showProgress) {
                    this.showSubtleNotification(
                        isSessionEnd ? '💾 Session committed to memory' : '🧠 Auto-committed to memory'
                    );
                }

                this.updateCommitProgressIndicator();
                this.updateSharedState();

                console.log('✅ Auto-commit successful. Counter reset to 0');
                return true;
            } else {
                throw new Error('Failed to auto-commit to memory');
            }
        } catch (error) {
            console.error('❌ Error during auto-commit:', error);
            return false;
        }
    }

    /**
     * NEW v1.6.0: Check if auto-commit threshold has been reached
     */
    async checkAutoCommitThreshold() {
        // Check if auto-commit is enabled
        const autoCommitEnabled = localStorage.getItem('cfg_auto_commit_enabled') === 'true';
        if (!autoCommitEnabled) return;

        // Get threshold from config
        const threshold = parseInt(localStorage.getItem('cfg_auto_commit_threshold') || '50', 10);

        console.log(`🧠 Auto-commit check: ${this.messagesSinceLastCommit}/${threshold} messages`);

        // Check if threshold reached
        if (this.messagesSinceLastCommit >= threshold) {
            console.log('🎯 Auto-commit threshold reached! Triggering commit...');
            await this.commitToMemoryAuto(false);
        } else {
            // Update progress indicator
            this.updateCommitProgressIndicator();
        }
    }

    /**
     * NEW v1.6.0: Update visual progress indicator for auto-commit
     * FIXED v1.6.3: Counter displays based ONLY on cfg_show_commit_progress setting
     */
    updateCommitProgressIndicator() {
        const showProgress = localStorage.getItem('cfg_show_commit_progress') !== 'false';

        const progressBar = document.getElementById('autoCommitProgressBar');
        const progressText = document.getElementById('autoCommitProgressText');

        if (!progressBar || !progressText) return;

        // BUGFIX v1.6.3: Show/hide based ONLY on cfg_show_commit_progress setting
        // Counter should be visible even if auto-commit is disabled
        if (!showProgress) {
            progressBar.style.display = 'none';
            return;
        }

        // Show the counter
        progressBar.style.display = 'block';

        const threshold = parseInt(localStorage.getItem('cfg_auto_commit_threshold') || '50', 10);
        const percentage = Math.min((this.messagesSinceLastCommit / threshold) * 100, 100);
        const progressFill = progressBar.querySelector('.progress-fill');

        if (progressFill) {
            progressFill.style.width = `${percentage}px`;
        }

        progressText.textContent = `${this.messagesSinceLastCommit}/${threshold}`;
    }

    /**
     * NEW v1.6.0: Show subtle notification for auto-commit
     */
    showSubtleNotification(message) {
        // Create floating notification
        const notification = document.createElement('div');
        notification.className = 'auto-commit-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(40, 40, 40, 0.95);
            color: #4CAF50;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    handleFileUpload(e) {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.setSingleImageFromFile(file);
            } else {
                this.processFile(file);
            }
        });
    }

    async processFile(file) {
        console.log('Processing file:', file.name);
        // File processing would be implemented here for non-images
        this.addMessage('system', `📎 File uploaded: ${file.name} (${this.bytesToSize(file.size)})`);
    }

    bytesToSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    restoreSessionState() {
        // Restore state from shared state or sessionStorage
        const state = this.sharedState;
        if (state.projectId) {
            this.currentProjectId = state.projectId;
            this.currentChatId = state.sessionId;
            this.currentRagId = state.ragSessionId;
        } else {
            // Try sessionStorage fallback
            try {
                const saved = sessionStorage.getItem('bobChatState');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.currentProjectId = data.projectId;
                    this.currentChatId = data.chatId;
                    this.currentRagId = data.ragId;
                }
            } catch (error) {
                console.warn('Failed to restore session state:', error);
            }
        }
    }

    loadSessionsFromStorage() {
        // This would typically load from backend
        // For now, just check if we have a current project
        if (this.currentProjectId) {
            this.switchToChat('Current Project');
        }
    }

    onStateChange(updates) {
        if (updates.projectId !== undefined) {
            this.currentProjectId = updates.projectId;
        }
        if (updates.sessionId !== undefined) {
            this.currentChatId = updates.sessionId;
        }
        if (updates.ragSessionId !== undefined) {
            this.currentRagId = updates.ragSessionId;
        }
        
        // NEW v1.2: Update history manager when state changes
        if (this.currentProjectId && this.currentChatId) {
            this.initializeHistoryManager();
        }
    }

    cleanup() {
        // Save state before cleanup
        try {
            sessionStorage.setItem('bobChatState', JSON.stringify({
                projectId: this.currentProjectId,
                chatId: this.currentChatId,
                ragId: this.currentRagId
            }));
        } catch (error) {
            console.warn('Failed to save chat state:', error);
        }
        
        console.log('Chat module v1.3.1.3 cleaned up');
    }

    /**
     * NEW v1.3.1.1: Add project info to header (duplicate from blue bar)
     */
    addProjectInfoToHeader() {
        // Remove any existing header project info
        this.removeProjectInfoFromHeader();

        // Find the header content container
        const headerContent = document.querySelector('.header-content');
        if (!headerContent) {
            console.warn('Header content not found for header project info');
            return;
        }

        // Get project info from the blue bar elements
        const projectName = document.getElementById('currentProjectName')?.textContent || 'Current Project';
        const projectId = document.getElementById('displayProjectId')?.textContent || 'None';
        const chatId = document.getElementById('displayChatId')?.textContent || 'None';
        const ragId = document.getElementById('displayRagId')?.textContent || 'None';

        // Create header project info container
        const headerProjectInfo = document.createElement('div');
        headerProjectInfo.id = 'header-project-info';
        headerProjectInfo.style.cssText = `
            position: absolute;
            left: 10px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            font-size: 0.85rem;
            line-height: 1.2;
            color: #0078d4;
            font-weight: 700;
            white-space: nowrap;
            cursor: help;
            z-index: 10;
        `;

        // Get persona label and description for tooltip
        const personaLabel = this.currentProjectPersona ? this.getPersonaLabel(this.currentProjectPersona) : 'None';
        const description = this.currentProjectDescription || 'No description';

        // Create tooltip for detailed info
        const tooltip = document.createElement('div');
        tooltip.id = 'header-project-tooltip';
        tooltip.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 5px;
            background: #fff;
            border: 1px solid #0078d4;
            border-radius: 4px;
            padding: 8px 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-size: 0.7rem;
            font-weight: 500;
            color: #333;
            white-space: normal;
            max-width: 300px;
            z-index: 1000;
        `;

        tooltip.innerHTML = `
            <div style="margin-bottom: 6px;"><strong>Description:</strong> ${description}</div>
            <div><strong>Persona:</strong> ${personaLabel}</div>
        `;

        // Show/hide tooltip on hover
        headerProjectInfo.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
        });

        headerProjectInfo.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // NEW v1.6.4: Add click handler to open edit modal
        headerProjectInfo.addEventListener('click', () => {
            this.openEditProjectInfoModal();
        });

        // Main display: just the project name
        headerProjectInfo.innerHTML = `${projectName}`;
        headerProjectInfo.appendChild(tooltip);

        // Update cursor to indicate clickable
        headerProjectInfo.style.cursor = 'pointer';

        // Insert into header content
        headerContent.appendChild(headerProjectInfo);

        console.log('✅ Project info added to header (with hover tooltip and click-to-edit)');
    }

    /**
     * NEW v1.3.1.1: Remove project info from header
     */
    removeProjectInfoFromHeader() {
        const headerProjectInfo = document.getElementById('header-project-info');
        if (headerProjectInfo) {
            headerProjectInfo.remove();
            console.log('✅ Project info removed from header');
        }
    }

    /**
     * NEW v1.3.1.6: Add dynamic version display to footer
     * UPDATED v1.4.4: Read version from shared state (set by module-loader)
     */
    addVersionDisplay() {
        try {
            // Get version from shared state (set by module-loader from filename)
            const state = this.moduleLoader.getState();
            let currentVersion = state.moduleVersion || 'unknown';

            // Log version detection for debugging
            if (currentVersion === 'unknown') {
                console.warn('Module version not detected - check module-loader.js');
            } else {
                console.log(`Chat module version detected: ${currentVersion}`);
            }
            
            // Update the footer version display
            const versionElement = document.getElementById('chat-version');
            if (versionElement) {
                versionElement.textContent = `Chat ${currentVersion}`;
                console.log(`✅ Version display updated: Chat ${currentVersion}`);
            } else {
                console.warn('Chat version element not found in footer');
            }
        } catch (error) {
            console.warn('Failed to update version display:', error);
        }
    }

    /**
     * NEW v1.3.1.2: Replace AI Assistant dropdown items only
     */
    replaceAIAssistantDropdownItems() {
        // Find the AI Assistant dropdown menu
        const aiAssistantNav = document.querySelector('[data-module="chat"]');
        if (!aiAssistantNav) {
            console.warn('AI Assistant navigation not found');
            return;
        }

        const dropdownMenu = aiAssistantNav.querySelector('.dropdown-menu');
        if (!dropdownMenu) {
            console.warn('AI Assistant dropdown menu not found');
            return;
        }

        // Store original content for restoration
        if (!this.originalAIAssistantDropdown) {
            this.originalAIAssistantDropdown = dropdownMenu.innerHTML;
        }

        // Replace dropdown items (keep Chat Interface, replace others)
        dropdownMenu.innerHTML = `
            <a href="#" class="dropdown-item">Chat Interface</a>
            <a href="#" class="dropdown-item" id="dropdown-commit">Commit to Memory</a>
            <a href="#" class="dropdown-item" id="dropdown-close-session">Close Session</a>
            <a href="#" class="dropdown-item" id="dropdown-clear">Clear History</a>
            <a href="#" class="dropdown-item" id="dropdown-switch">Switch Project</a>
        `;

        // Wire up event handlers for new items with enhanced functionality
        const dropdownCommit = document.getElementById('dropdown-commit');
        if (dropdownCommit) {
            dropdownCommit.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Commit to Memory clicked from dropdown');
                this.commitToMemoryFromDropdown();
            });
        }

        // NEW v1.6.2: Close Session handler
        const dropdownCloseSession = document.getElementById('dropdown-close-session');
        if (dropdownCloseSession) {
            dropdownCloseSession.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Close Session clicked from dropdown');
                this.closeSessionFromDropdown();
            });
        }

        const dropdownClear = document.getElementById('dropdown-clear');
        if (dropdownClear) {
            dropdownClear.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Clear History clicked from dropdown');
                this.clearChatHistoryFromDropdown();
            });
        }

        const dropdownSwitch = document.getElementById('dropdown-switch');
        if (dropdownSwitch) {
            dropdownSwitch.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Switch Project clicked from dropdown');
                this.switchProjectFromDropdown();
            });
        }

        console.log('✅ AI Assistant dropdown items replaced');
    }

    /**
     * NEW v1.3.1.2: Restore original AI Assistant dropdown
     */
    restoreAIAssistantDropdown() {
        const aiAssistantNav = document.querySelector('[data-module="chat"]');
        if (aiAssistantNav && this.originalAIAssistantDropdown) {
            const dropdownMenu = aiAssistantNav.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.innerHTML = this.originalAIAssistantDropdown;
                console.log('✅ Original AI Assistant dropdown restored');
            }
        }
    }

    /**
     * NEW v1.3.1.3: Enhanced dropdown functionality
     */
    commitToMemoryFromDropdown() {
        if (!this.currentProjectId) {
            alert('Please select a project first before committing to memory.');
            return;
        }
        
        // Call the existing commit method
        this.commitToMemory();
        
        // Show user feedback
        console.log('✅ Commit to Memory triggered from AI Assistant dropdown');
    }

    clearChatHistoryFromDropdown() {
        if (!this.currentProjectId) {
            alert('Please select a project first.');
            return;
        }

        // Confirm before clearing
        const confirmed = confirm('Are you sure you want to clear the chat history for this project? This action cannot be undone.');
        if (confirmed) {
            this.clearChatHistory();
            console.log('✅ Chat History cleared from AI Assistant dropdown');
        }
    }

    /**
     * NEW v1.6.2: Close current session with auto-commit
     */
    async closeSessionFromDropdown() {
        const hasMessages = this.hasExistingMessages();

        if (!hasMessages) {
            // No messages, just close
            await this.closeSession();
            return;
        }

        // Ask user if they want to commit before closing
        const commitOnSessionEnd = localStorage.getItem('cfg_commit_on_session_end') !== 'false';
        const autoCommitEnabled = localStorage.getItem('cfg_auto_commit_enabled') === 'true';

        if (commitOnSessionEnd && autoCommitEnabled && this.messagesSinceLastCommit > 0) {
            const confirmed = confirm(`Close session and auto-commit ${this.messagesSinceLastCommit} uncommitted messages to memory?`);
            if (!confirmed) {
                return;
            }
        } else if (this.messagesSinceLastCommit > 0) {
            const confirmed = confirm('Close session without committing to memory? (You can enable auto-commit in Configuration)');
            if (!confirmed) {
                return;
            }
        }

        await this.closeSession();
    }

    /**
     * NEW v1.6.2: Close session (with optional auto-commit)
     */
    async closeSession() {
        console.log('🔒 Closing session...');

        // Auto-commit if enabled and there are uncommitted messages
        const commitOnSessionEnd = localStorage.getItem('cfg_commit_on_session_end') !== 'false';
        if (commitOnSessionEnd && this.messagesSinceLastCommit > 0 && this.currentRagId) {
            console.log('💾 Session closing - triggering auto-commit...');
            const committed = await this.commitToMemoryAuto(true);

            if (committed) {
                // Show success message
                this.showSubtleNotification('✅ Session committed and closed');
            }
        } else {
            console.log('ℹ️ Session closed without commit (no uncommitted messages or auto-commit disabled)');
        }

        // Clear session state
        this.currentProjectId = null;
        this.currentChatId = null;
        this.currentRagId = null;
        this.messagesSinceLastCommit = 0;

        // Remove project info from header
        this.removeProjectInfoFromHeader();

        // Restore original AI Assistant dropdown
        this.restoreAIAssistantDropdown();

        // Clear history manager
        this.historyManager = null;

        // Hide chat interface, show project launcher
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('projectLauncher').style.display = 'flex';

        // Clear chat window
        this.clearChatWindow(true);

        // Update shared state
        this.updateSharedState();

        console.log('✅ Session closed successfully');
    }

    /**
     * NEW v1.6.2: Set up Page Visibility API listener for tab focus detection
     * Refreshes counter when user returns to tab (multi-device/multi-tab sync)
     */
    setupTabVisibilityListener() {
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden && this.currentChatId) {
                // Tab became visible - refresh counter from backend
                console.log('👁️ Tab visible - refreshing counter from backend...');
                await this.refreshCounterFromBackend();
            }
        });
        console.log('✅ Tab visibility listener installed for multi-device counter sync');
    }

    /**
     * NEW v1.6.2: Refresh counter from backend conversation_history
     * Solves multi-device/multi-tab stale counter problem
     */
    async refreshCounterFromBackend() {
        if (!this.currentChatId) {
            console.log('⚠️ No active session, skipping counter refresh');
            return;
        }

        try {
            // Query backend for current message count
            const response = await this.fetchWithTimeout(this.endpoints.loadHistory, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_session_id: this.currentChatId,
                    max_context: 1000 // Get full count
                })
            });

            if (!response.ok) {
                console.warn('⚠️ Failed to refresh counter from backend');
                return;
            }

            const result = await response.json();

            if (result.success && result.count !== undefined) {
                const oldCount = this.messagesSinceLastCommit;
                const newCount = result.count;

                // Update counter to match backend
                this.messagesSinceLastCommit = newCount;
                this.updateCommitProgressIndicator();

                if (newCount !== oldCount) {
                    console.log(`🔄 Counter refreshed: ${oldCount} → ${newCount} (backend sync)`);
                } else {
                    console.log(`✅ Counter in sync: ${newCount} messages`);
                }
            }
        } catch (error) {
            console.error('❌ Error refreshing counter from backend:', error);
        }
    }

    async switchProjectFromDropdown() {
        // Confirm if there's unsaved work
        const hasMessages = this.hasExistingMessages();
        if (hasMessages) {
            const confirmed = await this.showCustomConfirm(
                'Switch Projects?',
                'You have an active chat session. Are you sure you want to switch projects?<br><br><strong>Tip:</strong> Consider committing important information to memory first.'
            );
            if (!confirmed) {
                return;
            }
        }

        await this.switchProject();
        console.log('✅ Project switch triggered from AI Assistant dropdown');
    }

    // NEW v1.6.4: Custom confirmation dialog (attractive Windows 11 style)
    showCustomConfirm(title, message) {
        return new Promise((resolve) => {
            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'custom-confirm-overlay';
            modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease-out;
            `;

            // Create modal container
            const modal = document.createElement('div');
            modal.id = 'custom-confirm-modal';
            modal.style.cssText = `
                background: #ffffff;
                border: 1px solid #e1dfdd;
                border-radius: 8px;
                padding: 24px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                animation: slideDown 0.3s ease-out;
            `;

            modal.innerHTML = `
                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: #fff4ce;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 16px;
                        flex-shrink: 0;
                    ">
                        <span style="font-size: 24px; color: #f9a825;">⚠️</span>
                    </div>
                    <div>
                        <h3 style="
                            color: #323130;
                            margin: 0 0 12px 0;
                            font-size: 18px;
                            font-weight: 600;
                            font-family: 'Segoe UI', sans-serif;
                        ">${title}</h3>
                        <p style="
                            color: #605e5c;
                            margin: 0;
                            font-size: 14px;
                            line-height: 1.6;
                            font-family: 'Segoe UI', sans-serif;
                        ">${message}</p>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;">
                    <button
                        id="custom-confirm-cancel-btn"
                        style="
                            padding: 8px 20px;
                            background: #f3f2f1;
                            color: #323130;
                            border: 1px solid #8a8886;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            font-family: 'Segoe UI', sans-serif;
                            min-width: 80px;
                        "
                        onmouseover="this.style.background='#e1dfdd'"
                        onmouseout="this.style.background='#f3f2f1'"
                    >Cancel</button>
                    <button
                        id="custom-confirm-ok-btn"
                        style="
                            padding: 8px 20px;
                            background: #0078d4;
                            color: #ffffff;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            font-family: 'Segoe UI', sans-serif;
                            min-width: 80px;
                        "
                        onmouseover="this.style.background='#106ebe'"
                        onmouseout="this.style.background='#0078d4'"
                    >OK</button>
                </div>

                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                </style>
            `;

            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);

            const cleanup = () => {
                modalOverlay.remove();
            };

            // OK button handler
            document.getElementById('custom-confirm-ok-btn').addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            // Cancel button handler
            document.getElementById('custom-confirm-cancel-btn').addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            // Close on overlay click
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    cleanup();
                    resolve(false);
                }
            });

            // Focus OK button for keyboard accessibility
            setTimeout(() => {
                document.getElementById('custom-confirm-ok-btn').focus();
            }, 100);
        });
    }

    // NEW v1.6.4: Modal methods for editing project info
    openEditProjectInfoModal() {
        const state = this.moduleLoader.getState();
        const currentProjectName = state.currentProject || 'Untitled Project';
        const currentDescription = state.projectDescription || '';

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'edit-project-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        // Create modal container - Windows 11 style
        const modal = document.createElement('div');
        modal.id = 'edit-project-modal';
        modal.style.cssText = `
            background: #ffffff;
            border: 1px solid #e1dfdd;
            border-radius: 8px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        `;

        modal.innerHTML = `
            <h2 style="color: #323130; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 600;">Edit Project Information</h2>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #323130; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Project Name:</label>
                <input
                    type="text"
                    id="edit-project-name-input"
                    value="${currentProjectName}"
                    style="
                        width: 100%;
                        padding: 10px 12px;
                        background: #ffffff;
                        border: 1px solid #8a8886;
                        border-radius: 4px;
                        color: #323130;
                        font-size: 14px;
                        box-sizing: border-box;
                        font-family: 'Segoe UI', sans-serif;
                    "
                />
            </div>

            <div style="margin-bottom: 25px;">
                <label style="display: block; color: #323130; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Description:</label>
                <textarea
                    id="edit-project-description-input"
                    rows="4"
                    style="
                        width: 100%;
                        padding: 10px 12px;
                        background: #ffffff;
                        border: 1px solid #8a8886;
                        border-radius: 4px;
                        color: #323130;
                        font-size: 14px;
                        box-sizing: border-box;
                        resize: vertical;
                        font-family: 'Segoe UI', sans-serif;
                    "
                >${currentDescription}</textarea>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button
                    id="edit-project-cancel-btn"
                    style="
                        padding: 8px 20px;
                        background: #f3f2f1;
                        color: #323130;
                        border: 1px solid #8a8886;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        font-family: 'Segoe UI', sans-serif;
                    "
                    onmouseover="this.style.background='#e1dfdd'"
                    onmouseout="this.style.background='#f3f2f1'"
                >Cancel</button>
                <button
                    id="edit-project-save-btn"
                    style="
                        padding: 8px 20px;
                        background: #0078d4;
                        color: #ffffff;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        font-family: 'Segoe UI', sans-serif;
                    "
                    onmouseover="this.style.background='#106ebe'"
                    onmouseout="this.style.background='#0078d4'"
                >Save Changes</button>
            </div>
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // Wire up event handlers
        document.getElementById('edit-project-cancel-btn').addEventListener('click', () => {
            this.closeEditProjectInfoModal();
        });

        document.getElementById('edit-project-save-btn').addEventListener('click', async () => {
            const newName = document.getElementById('edit-project-name-input').value.trim();
            const newDescription = document.getElementById('edit-project-description-input').value.trim();

            if (!newName) {
                alert('Project name cannot be empty');
                return;
            }

            await this.updateProjectInfo(newName, newDescription);
        });

        // Close on overlay click (outside modal)
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeEditProjectInfoModal();
            }
        });

        // Focus on name input
        setTimeout(() => {
            document.getElementById('edit-project-name-input').focus();
            document.getElementById('edit-project-name-input').select();
        }, 100);

        console.log('✅ Edit project info modal opened');
    }

    async updateProjectInfo(newName, newDescription) {
        const state = this.moduleLoader.getState();
        const sessionId = state.sessionId;

        if (!sessionId) {
            console.error('❌ No session ID found');
            alert('Error: No active session');
            return;
        }

        try {
            console.log('📤 Updating project info:', { newName, newDescription, sessionId });

            const response = await fetch(this.endpoints.updateProjectInfo, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_session_id: sessionId,
                    project_name: newName,
                    description: newDescription
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Project info updated:', result);

            if (result.success) {
                // Update module loader state
                this.moduleLoader.setState({
                    currentProject: newName,
                    projectDescription: newDescription
                });

                // Update internal instance variables
                this.currentProjectDescription = newDescription;

                // Update the blue bar display elements
                const projectNameElement = document.getElementById('currentProjectName');
                if (projectNameElement) {
                    projectNameElement.textContent = newName;
                }

                // Update header display (this will recreate the tooltip with new values)
                this.addProjectInfoToHeader();

                // Reload the project list dropdown to show updated name
                // Only reload if we're not currently in chat view (dropdown is visible)
                const projectLauncher = document.getElementById('projectLauncher');
                if (projectLauncher && projectLauncher.style.display !== 'none') {
                    await this.loadExistingProjects();
                }

                // Close modal
                this.closeEditProjectInfoModal();

                // Show success notification
                this.showSubtleNotification('✅ Project information updated successfully');

                console.log('✅ All UI elements updated with new project info');
            } else {
                throw new Error(result.error || 'Update failed');
            }

        } catch (error) {
            console.error('❌ Error updating project info:', error);
            alert(`Error updating project: ${error.message}`);
        }
    }

    closeEditProjectInfoModal() {
        const modalOverlay = document.getElementById('edit-project-modal-overlay');
        if (modalOverlay) {
            modalOverlay.remove();
            console.log('✅ Edit project info modal closed');
        }
    }
}

// Export the module
// Export for ES6 modules
export default ChatModule;

// Also make available globally for direct script loading
window.ChatModule = ChatModule;