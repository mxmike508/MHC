/**
 * CHAT MODULE v1.2 - Bob AI Platform Main Interface
 * 
 * Enhanced version with localStorage chat history:
 * - Fixed input area at bottom (from v1.1)
 * - Properly scrollable chat content area (from v1.1)
 * - Better responsive design (from v1.1)
 * - NEW: localStorage chat history persistence
 * - NEW: Chat transcript restoration on project load
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
     * Save a single message to localStorage
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

            // Save back to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(history));
            
            console.log(`📚 Message saved to history: ${sender}`, messageData);
            return messageData;
        } catch (error) {
            console.warn('Failed to save message to localStorage:', error);
            return null;
        }
    }

    /**
     * Load complete chat history from localStorage
     */
    loadHistory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const history = JSON.parse(stored);
                console.log(`📖 Loaded ${history.length} messages from history for ${this.storageKey}`);
                return Array.isArray(history) ? history : [];
            }
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
            documentHandler: 'https://n8n.srv997771.hstgr.cloud/webhook/0f0b56ad-64e2-4008-9108-eb247c85787c'
        };
        
        // Chat state
        this.currentProjectId = null;
        this.currentChatId = null;
        this.currentRagId = null;
        this.sessions = {};
        this.isSending = false;
        this.requestSeq = 0;
        this.librariesLoaded = false; // Track markdown library loading
        
        // NEW v1.2: Chat history manager
        this.historyManager = null;
        
        // Image handling state (Chat v10.4 compatible)
        this.currentImageData = null; // base64 fallback
        this.currentImageUrl = null;  // preferred URL from handler
        
        // UI elements (will be set in postRender)
        this.chatWindow = null;
        this.chatInput = null;
        this.sendButton = null;
        this.sessionSelect = null;
    }

    async init(subModule = null) {
        console.log('Chat module v1.2 initialized with localStorage chat history');
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
     * NEW v1.2: Restore chat history from localStorage
     */
    restoreChatHistory() {
        if (!this.historyManager || !this.chatWindow) return;

        const history = this.historyManager.loadHistory();
        if (history.length === 0) {
            console.log('📖 No chat history to restore');
            return;
        }

        console.log(`📖 Restoring ${history.length} messages from chat history`);

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

        console.log('✅ Chat history restored successfully');
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
                    <!-- Chat Header with Project Info -->
                    <div class="chat-header">
                        <div class="project-info">
                            <h2 id="currentProjectName">Bob AI Chat</h2>
                            <div class="project-meta">
                                <span class="project-id">Project: <span id="displayProjectId">${this.currentProjectId || 'None'}</span></span>
                                <span class="session-id">Session: <span id="displayChatId">${this.currentChatId || 'None'}</span></span>
                                <span class="rag-id">RAG: <span id="displayRagId">${this.currentRagId || 'None'}</span></span>
                            </div>
                        </div>
                        <div class="chat-actions">
                            <button class="action-btn" id="commitMemoryBtn" disabled>
                                💾 Commit to Memory
                            </button>
                            <button class="action-btn" id="clearHistoryBtn" title="Clear chat history for this project">
                                🗑️ Clear History
                            </button>
                            <button class="action-btn secondary" id="switchProjectBtn">
                                🔄 Switch Project
                            </button>
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

                /* Project Launcher Styles (unchanged) */
                .project-launcher {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
                    padding: 2rem;
                }

                .launcher-content {
                    max-width: 800px;
                    width: 100%;
                    text-align: center;
                }

                .launcher-header h1 {
                    font-size: 2.5rem;
                    color: #0078d4;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }

                .launcher-header p {
                    font-size: 1.2rem;
                    color: #666;
                    margin-bottom: 3rem;
                }

                .launcher-options {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .launcher-card {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
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
                    padding: 2rem;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    max-width: 500px;
                    margin: 2rem auto 0;
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

                /* Responsive Design */
                @media (max-width: 768px) {
                    .launcher-options {
                        grid-template-columns: 1fr;
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
            </style>
        `;
    }

    async postRender() {
        // Get UI element references
        this.chatWindow = document.getElementById('chatWindow');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.sessionSelect = document.getElementById('sessionSelect');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // NEW v1.2: Initialize history manager and restore chat history
        this.initializeHistoryManager();
        
        // Load existing sessions if needed
        if (!this.currentProjectId) {
            this.loadSessionsFromStorage();
        } else {
            // Restore chat history if we have an active project
            this.restoreChatHistory();
        }
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
            const response = await fetch(this.endpoints.listProjects, {
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
        
        if (!name) {
            alert('Please enter a project name');
            return;
        }

        try {
            let endpoint, payload;
            
            if (dataUrl && enableRag) {
                // Create project with RAG indexing
                endpoint = this.endpoints.ragIndexing;
                payload = {
                    projectName: name,
                    persona_key: 'dev_assistant',
                    database_branch: 'main',
                    xata_branch: 'main',
                    data_url: dataUrl
                };
            } else {
                // Create simple project - match Chat v10.4 format exactly
                endpoint = this.endpoints.setup;
                payload = {
                    projectName: name,                // ✅ Match n8n workflow expectation
                    persona_key: 'dev_assistant',     // ✅ Required field
                    database_branch: 'main',         // ✅ Required field  
                    xata_branch: 'main'              // ✅ Required field
                };
            }

            const response = await fetch(endpoint, {
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

    switchToChat(projectName) {
        document.getElementById('projectLauncher').style.display = 'none';
        document.getElementById('chatInterface').style.display = 'flex';
        
        document.getElementById('currentProjectName').textContent = projectName;
        // Show friendly name instead of raw ID - hide technical IDs from user view
        document.getElementById('displayProjectId').textContent = projectName || 'Current Project';
        document.getElementById('displayChatId').textContent = 'Active';
        document.getElementById('displayRagId').textContent = this.currentRagId ? 'Enabled' : 'None';
        
        // NEW v1.2: Restore chat history when switching to chat
        this.restoreChatHistory();
    }

    switchProject() {
        this.currentProjectId = null;
        this.currentChatId = null;
        this.currentRagId = null;
        
        // NEW v1.2: Clear history manager when switching projects
        this.historyManager = null;
        
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('projectLauncher').style.display = 'flex';
        
        // Clear chat window
        this.clearChatWindow(true);
        
        this.updateSharedState();
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

    // Model type detection (Chat v10.4 compatible)
    getModelTypeFromContext(message, hasImage) {
        if (hasImage) return 'vision';
        
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
            
            const response = await fetch(this.endpoints.imageHandler, { 
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
    
    renderImagePreview(img) {
        const previewEl = document.getElementById('filePreview');
        if (!previewEl) return;
        
        const safeName = (img.filename || 'image').replace(/[<>&]/g, '');
        const src = img.url || img.dataUri;
        const details = `${safeName} · ${img.mime || ''} · ${this.bytesToSize(img.size)}`.trim();
        
        previewEl.innerHTML = `
            <div>
              <img src="${src}" alt="preview" style="max-width:150px;max-height:150px;border:1px solid #ddd;display:block;margin:5px auto;" />
              <p>${details}</p>
              <button type="button" id="removeImageBtn">Remove Image</button>
            </div>`;
            
        // Set up remove button
        const removeBtn = document.getElementById('removeImageBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.clearSingleImage());
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
                const userMd = (message ? (message + '\n\n') : '') + `![image](${imgSrc})`;
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
                database_branch: 'main',              // Added: Database branch (default to main)
                xata_branch: 'main',                  // Added: Xata branch configuration
                selected_model: 'claude-4-sonnet',    // Added: Default model selection
                model_type: this.getModelTypeFromContext(message || '', !!(imageUrl || imageAttachment)), // Added: Detect vision model
                system_prompt_content: undefined,     // Added: System prompt (none for now)
                document_context: window.uploadedDocumentContext || undefined
            };
            
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
            
            const response = await fetch(chatUrl, {
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
                    // Process image thumbnails before displaying
                    const processedReply = this.processImageThumbnails(reply);
                    
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
                
                // Enable commit button
                document.getElementById('commitMemoryBtn').disabled = false;
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

    processImageThumbnails(html) {
        // Convert Google Storage URLs and other image URLs to proper thumbnails
        // Pattern: https://storage.googleapis.com/bucket/path/image.ext or similar long URLs
        const imageUrlPattern = /(https:\/\/storage\.googleapis\.com\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp))/gi;
        const longUrlPattern = /(https:\/\/[^\s<>"']{50,}\.(jpg|jpeg|png|gif|webp))/gi;
        
        // First clean up any existing unwanted HTML markup around images
        html = html.replace(/<p>\s*(<img[^>]*>)\s*<\/p>/gi, '$1');
        html = html.replace(/<br[^>]*>\s*(<img[^>]*>)/gi, '$1');
        html = html.replace(/(<img[^>]*>)\s*<br[^>]*>/gi, '$1');
        
        // Track processed URLs to prevent duplicates
        const processedUrls = new Set();
        
        // Replace with actual image tags for better UX - prevent duplicates
        html = html.replace(imageUrlPattern, (match, url) => {
            if (processedUrls.has(url)) {
                return ''; // Remove duplicate
            }
            processedUrls.add(url);
            return `<div style="margin: 15px 0;"><img src="${url}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; cursor: pointer; display: block;" onclick="window.open('${url}', '_blank')" /></div>`;
        });
        
        html = html.replace(longUrlPattern, (match, url) => {
            if (processedUrls.has(url)) {
                return ''; // Remove duplicate
            }
            processedUrls.add(url);
            return `<div style="margin: 15px 0;"><img src="${url}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; cursor: pointer; display: block;" onclick="window.open('${url}', '_blank')" /></div>`;
        });
        
        // Clean up any remaining unwanted text patterns around images
        html = html.replace(/Image:\s*(<div[^>]*><img[^>]*><\/div>)/gi, '$1');
        html = html.replace(/Here.*?image[^:]*:\s*(<div[^>]*><img[^>]*><\/div>)/gi, '$1');
        html = html.replace(/The.*?image.*?shows[^:]*:\s*(<div[^>]*><img[^>]*><\/div>)/gi, '$1');
        
        // Remove any duplicate image containers that might still exist
        html = html.replace(/(<div[^>]*><img[^>]*src="([^"]+)"[^>]*><\/div>)[\s\S]*?<div[^>]*><img[^>]*src="\2"[^>]*><\/div>/gi, '$1');
        
        return html;
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
            const response = await fetch(this.endpoints.commitMemory, {
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
                document.getElementById('displayRagId').textContent = this.currentRagId;
                document.getElementById('commitMemoryBtn').disabled = true;
                this.updateSharedState();
            } else {
                throw new Error('Failed to commit to memory');
            }
        } catch (error) {
            console.error('Error committing to memory:', error);
            this.addMessage('system', '❌ Failed to commit conversation to memory');
        }
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
        
        console.log('Chat module v1.2 cleaned up');
    }
}

// Export the module
// Export for ES6 modules
export default ChatModule;

// Also make available globally for direct script loading
window.ChatModule = ChatModule;