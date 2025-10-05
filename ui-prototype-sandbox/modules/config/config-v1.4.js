/**
 * CONFIG MODULE v1.4 - Bob AI Platform Configuration Interface
 * BITE #5: Personas Management Integration
 * 
 * NEW IN v1.4: Personas section with improved list → detail edit UI
 * INCLUDES: Model Selection (Bite #2) + Database Branch (Bite #3) + Features (Bite #4) + Personas (Bite #5)
 * 
 * Features:
 * - Fixed-position slide-out panel from right side
 * - Model Selection: 4 AI model types with localStorage persistence
 * - Database Branch: Production vs Testing branch selection
 * - Features: User preference toggles for behavior control
 * - Personas: AI personality management with clean list/edit interface
 * - Save/Cancel workflow with chat integration
 * - Clean modular architecture
 */

export default class ConfigModule {
    constructor(moduleLoader) {
        this.moduleLoader = moduleLoader;
        this.isOpen = false;
        this.personaEditMode = false; // Track if we're in list or edit mode
        this.editingPersona = null; // Track which persona is being edited
    }

    async init() {
        console.log('🔧 Config Module v1.4 initializing...');
        // Module initialization
    }

    render() {
        // Create the slide-out panel as a global overlay (outside main content area)
        this.createConfigPanel();
        
        // Return absolutely nothing to prevent any container from being created
        return '';
    }

    createConfigPanel() {
        // Create the slide-out panel as a global overlay
        const existingPanel = document.getElementById('config-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panelHTML = `
            <!-- Configuration Panel (Fixed Overlay from right) -->
            <div id="config-panel" class="config-panel">
                <div id="config-panel-header" class="config-panel-header">
                    <h3>⚙️ Configuration</h3>
                    <button id="config-close-btn" class="config-close-btn">&times;</button>
                </div>
                
                <!-- Config sections -->
                <div class="config-sections">
                    <!-- Model Selection Section -->
                    <div class="config-section collapsed" id="model-section">
                        <div class="config-section-header">
                            <div class="config-section-title">
                                <span class="config-section-icon">🤖</span>
                                Model Selection
                            </div>
                            <span class="config-section-toggle">▶</span>
                        </div>
                        <div class="config-section-content">
                            <p>Choose the optimal AI model for different types of tasks and conversations.</p>
                            
                            <div class="config-item">
                                <label>Default Chat Model</label>
                                <select id="cfg-default-model">
                                    <option value="claude-4-sonnet" selected>Claude 4 Sonnet - Strategic thinking</option>
                                    <option value="gpt-4o">GPT-4o (OpenAI) - Balanced performance</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo - Fast responses</option>
                                    <option value="claude-3-opus">Claude 3 Opus - Deep analysis</option>
                                </select>
                            </div>
                            
                            <div class="config-item">
                                <label>Vision Model (Image Analysis)</label>
                                <select id="cfg-vision-model">
                                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                                    <option value="claude-4-sonnet">Claude 4 Sonnet</option>
                                    <option value="gpt-4-vision">GPT-4 Vision</option>
                                </select>
                            </div>
                            
                            <div class="config-item">
                                <label>Code & Technical Model</label>
                                <select id="cfg-code-model">
                                    <option value="claude-4-sonnet" selected>Claude 4 Sonnet (Recommended)</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                </select>
                            </div>
                            
                            <div class="config-item">
                                <label>Strategic Planning Model</label>
                                <select id="cfg-strategy-model">
                                    <option value="claude-4-sonnet" selected>Claude 4 Sonnet (Recommended)</option>
                                    <option value="claude-3-opus">Claude 3 Opus - Deep thinking</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Database Branch Section -->
                    <div class="config-section collapsed" id="database-section">
                        <div class="config-section-header">
                            <div class="config-section-title">
                                <span class="config-section-icon">🌿</span>
                                Database Branch
                            </div>
                            <span class="config-section-toggle">▶</span>
                        </div>
                        <div class="config-section-content">
                            <p>Control which database branch to use for projects and conversations.</p>
                            
                            <div class="config-item">
                                <label>Current Branch</label>
                                <select id="cfg-database-branch">
                                    <option value="main">🌟 Production (Main Branch)</option>
                                    <option value="testing-archive-aug2025">🧪 Test Branch (Archive)</option>
                                </select>
                            </div>
                            
                            <div class="branch-status" id="branch-status-display">
                                <strong>Status:</strong> <span id="branch-status-text">Production - Clean environment</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Features Section -->
                    <div class="config-section collapsed" id="features-section">
                        <div class="config-section-header">
                            <div class="config-section-title">
                                <span class="config-section-icon">⚙️</span>
                                Features
                            </div>
                            <span class="config-section-toggle">▶</span>
                        </div>
                        <div class="config-section-content">
                            <p>Enable or disable specific features and behaviors.</p>
                            
                            <div class="config-item">
                                <div class="config-toggle">
                                    <input type="checkbox" id="cfg-show-toasts" checked>
                                    <label for="cfg-show-toasts">Show commit notification toasts</label>
                                </div>
                                <div class="config-description">
                                    Display popup notifications when successfully committing information to memory.
                                </div>
                            </div>
                            
                            <div class="config-item">
                                <div class="config-toggle">
                                    <input type="checkbox" id="cfg-vision-auto" checked>
                                    <label for="cfg-vision-auto">Automatically use vision model for images</label>
                                </div>
                                <div class="config-description">
                                    Automatically switch to vision model when images are detected in conversations.
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Personas Section -->
                    <div class="config-section collapsed" id="personas-section">
                        <div class="config-section-header">
                            <div class="config-section-title">
                                <span class="config-section-icon">👤</span>
                                Personas
                            </div>
                            <span class="config-section-toggle">▶</span>
                        </div>
                        <div class="config-section-content">
                            <p>Manage AI personas and conversation styles for different contexts.</p>
                            
                            <!-- Persona List View (default) -->
                            <div id="persona-list-view">
                                <div id="persona-list">
                                    <!-- Personas will be dynamically populated here -->
                                </div>
                                <button type="button" id="persona-add-btn" class="config-btn config-add-btn">
                                    + Add Persona
                                </button>
                            </div>
                            
                            <!-- Persona Edit View (hidden by default) -->
                            <div id="persona-edit-view" style="display: none;">
                                <div class="persona-edit-header">
                                    <h4 id="persona-edit-title">Edit Persona</h4>
                                </div>
                                
                                <div class="config-item">
                                    <label for="persona-key">Key</label>
                                    <input type="text" id="persona-key" placeholder="unique_key" maxlength="50">
                                    <div class="config-description">
                                        Unique identifier for this persona (lowercase, underscores only).
                                    </div>
                                </div>
                                
                                <div class="config-item">
                                    <label for="persona-label">Label</label>
                                    <input type="text" id="persona-label" placeholder="Display Name" maxlength="100">
                                    <div class="config-description">
                                        Friendly name shown in dropdowns and selection lists.
                                    </div>
                                </div>
                                
                                <div class="config-item">
                                    <label for="persona-content">System Prompt</label>
                                    <textarea id="persona-content" rows="6" placeholder="You are a helpful AI assistant that..."></textarea>
                                    <div class="config-description">
                                        Instructions that define how the AI should behave and respond.
                                    </div>
                                </div>
                                
                                <div class="persona-edit-actions">
                                    <button type="button" id="persona-save-btn" class="config-btn config-save">Save</button>
                                    <button type="button" id="persona-cancel-btn" class="config-btn config-cancel">Cancel</button>
                                    <button type="button" id="persona-delete-btn" class="config-btn config-delete" style="display: none;">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Save/Cancel buttons -->
                <div class="config-footer">
                    <button id="config-cancel" class="config-btn config-cancel">Cancel</button>
                    <button id="config-save" class="config-btn config-save">Save Changes</button>
                </div>
            </div>
        `;

        // Add styles to head
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Configuration Panel Styles - Base styles from v1.3 + Personas additions */
            .config-panel {
                position: fixed;
                top: 0;
                right: -400px; /* Hidden by default */
                width: 400px;
                height: 100vh;
                background: #ffffff;
                box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                z-index: 1000;
                transition: right 0.3s ease-in-out;
                overflow-y: auto;
                border-left: 1px solid #e0e0e0;
            }
            
            .config-panel.open {
                right: 0; /* Slide in when open */
            }
            
            .config-panel-header {
                background: #f8f9fa;
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
                position: sticky;
                top: 0;
                z-index: 10;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .config-panel-header h3 {
                margin: 0;
                color: #333;
                font-size: 1.2em;
            }
            
            .config-close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .config-close-btn:hover {
                background: #e0e0e0;
                color: #333;
            }
            
            .config-sections {
                padding: 20px;
                min-height: calc(100vh - 140px);
            }
            
            .config-placeholder {
                text-align: center;
                padding: 40px 20px;
                color: #666;
                border: 2px dashed #ddd;
                border-radius: 8px;
                background: #f9f9f9;
            }
            
            .config-footer {
                position: sticky;
                bottom: 0;
                background: #ffffff;
                border-top: 1px solid #e0e0e0;
                padding: 15px 20px;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .config-btn {
                padding: 10px 20px;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            .config-cancel {
                background: #f8f9fa;
                color: #666;
            }
            
            .config-cancel:hover {
                background: #e9ecef;
                border-color: #bbb;
            }
            
            .config-save {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }
            
            .config-save:hover {
                background: #0056b3;
                border-color: #0056b3;
            }
            
            /* Config Section Styles */
            .config-section {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 16px;
                background: #ffffff;
            }
            
            .config-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                cursor: pointer;
                border-bottom: 1px solid #e0e0e0;
                background: #f8f9fa;
                border-radius: 8px 8px 0 0;
            }
            
            .config-section-header:hover {
                background: #e9ecef;
            }
            
            .config-section-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: #333;
            }
            
            .config-section-icon {
                font-size: 1.2em;
            }
            
            .config-section-toggle {
                color: #666;
                font-size: 0.9em;
                transition: transform 0.2s ease;
            }
            
            .config-section.collapsed .config-section-toggle {
                transform: rotate(-90deg);
            }
            
            .config-section-content {
                padding: 20px;
            }
            
            .config-section.collapsed .config-section-content {
                display: none;
            }
            
            .config-item {
                margin-bottom: 16px;
            }
            
            .config-item:last-child {
                margin-bottom: 0;
            }
            
            .config-item label {
                display: block;
                margin-bottom: 6px;
                font-weight: 500;
                color: #333;
                font-size: 14px;
            }
            
            .config-item select, .config-item input[type="text"], .config-item textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #ffffff;
                font-size: 14px;
                color: #333;
                box-sizing: border-box;
            }
            
            .config-item select {
                appearance: auto !important;
                -webkit-appearance: menulist !important;
                -moz-appearance: menulist !important;
                cursor: pointer;
            }
            
            .config-item select:focus, .config-item input:focus, .config-item textarea:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }
            
            /* Enhanced dropdown option styling */
            .config-item select option {
                padding: 8px 12px;
                background: #ffffff;
                color: #333;
                border: none;
                min-height: 20px;
            }
            
            .config-item select option:hover {
                background: #f8f9fa;
            }
            
            /* Specific styling for database branch dropdown */
            #cfg-database-branch {
                min-height: 40px;
                background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><polygon fill="%23333" points="0,0 12,0 6,6"/></svg>') !important;
                background-repeat: no-repeat !important;
                background-position: right 8px center !important;
                background-size: 12px !important;
                padding-right: 32px !important;
            }
            
            #cfg-database-branch option {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                padding: 8px !important;
                background: #fff !important;
                color: #333 !important;
            }
            
            /* Database Branch Status Styles */
            .branch-status {
                margin-top: 16px;
                padding: 12px;
                border-radius: 6px;
                background: #f8f9fa;
                border-left: 4px solid #4caf50;
                font-size: 14px;
            }
            
            .branch-status strong {
                color: #333;
            }
            
            #branch-status-text {
                color: #2e7d32;
                font-weight: 500;
            }
            
            /* Testing branch styling */
            .branch-status.testing {
                border-left-color: #ff9800;
                background: #fff3e0;
            }
            
            .branch-status.testing #branch-status-text {
                color: #f57c00;
            }
            
            /* Production branch styling */  
            .branch-status.production {
                border-left-color: #4caf50;
                background: #e8f5e8;
            }
            
            .branch-status.production #branch-status-text {
                color: #2e7d32;
            }
            
            /* Features Toggle Styles */
            .config-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
            }
            
            .config-toggle input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: #007bff;
            }
            
            .config-toggle label {
                margin: 0;
                cursor: pointer;
                font-weight: 500;
                color: #333;
                flex: 1;
            }
            
            .config-description {
                font-size: 12px;
                color: #666;
                margin-left: 26px;
                margin-bottom: 8px;
                line-height: 1.4;
            }
            
            /* Personas Styles */
            .persona-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                margin-bottom: 8px;
                background: #f8f9fa;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .persona-item:hover {
                background: #e9ecef;
                border-color: #007bff;
            }
            
            .persona-item-info {
                flex: 1;
            }
            
            .persona-item-name {
                font-weight: 500;
                color: #333;
                margin-bottom: 2px;
            }
            
            .persona-item-key {
                font-size: 12px;
                color: #666;
                font-family: monospace;
            }
            
            .persona-item-badge {
                background: #007bff;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 3px;
                text-transform: uppercase;
                font-weight: 500;
            }
            
            .persona-item-badge.default {
                background: #6c757d;
            }
            
            .config-add-btn {
                background: #28a745;
                color: white;
                border-color: #28a745;
                width: 100%;
                margin-top: 12px;
            }
            
            .config-add-btn:hover {
                background: #218838;
                border-color: #218838;
            }
            
            /* Persona Edit View */
            .persona-edit-header {
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .persona-edit-header h4 {
                margin: 0;
                color: #333;
                font-size: 1.1em;
            }
            
            .persona-edit-actions {
                display: flex;
                gap: 8px;
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid #e0e0e0;
            }
            
            .config-delete {
                background: #dc3545;
                color: white;
                border-color: #dc3545;
                margin-left: auto;
            }
            
            .config-delete:hover {
                background: #c82333;
                border-color: #bd2130;
            }
            
            /* Textarea specific styling */
            .config-item textarea {
                resize: vertical;
                min-height: 120px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
            }
            
            /* Input validation styles */
            .config-item input.error, .config-item textarea.error {
                border-color: #dc3545;
                box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
            }
            
            /* Custom Notification Styles */
            .config-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                min-width: 300px;
                max-width: 400px;
                z-index: 2000;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideInRight 0.3s ease-out;
            }
            
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
            
            .config-notification-content {
                display: flex;
                align-items: center;
                padding: 16px;
                gap: 12px;
                border-radius: 8px;
            }
            
            .config-notification-success .config-notification-content {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            
            .config-notification-error .config-notification-content {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            
            .config-notification-warning .config-notification-content {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
            }
            
            .config-notification-info .config-notification-content {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
            }
            
            .config-notification-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .config-notification-message {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
            }
            
            .config-notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: inherit;
                opacity: 0.7;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            
            .config-notification-close:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.1);
            }
            
            /* Custom Confirmation Dialog Styles */
            .config-confirmation-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 2001;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .config-confirmation-dialog {
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                max-width: 400px;
                min-width: 300px;
                margin: 20px;
                animation: scaleIn 0.3s ease-out;
            }
            
            @keyframes scaleIn {
                from {
                    transform: scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            .config-confirmation-content {
                padding: 24px;
                text-align: center;
            }
            
            .config-confirmation-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .config-confirmation-message {
                font-size: 16px;
                color: #333;
                margin-bottom: 24px;
                line-height: 1.5;
            }
            
            .config-confirmation-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .config-confirmation-actions .config-btn {
                min-width: 80px;
                padding: 10px 20px;
            }
        `;

        document.head.appendChild(styleElement);
        document.body.insertAdjacentHTML('beforeend', panelHTML);
    }

    async postRender() {
        // Wait longer for DOM to be ready (increased from 200ms to 500ms)
        setTimeout(() => {
            console.log('🔧 Starting config panel setup...');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load saved model selections
            this.loadModelSelections();
            
            // Load saved database branch
            this.loadDatabaseBranch();
            
            // Load saved features
            this.loadFeatures();
            
            // Load and render personas
            this.loadPersonas();
            
            // Auto-open the config panel
            this.openPanel();
        }, 500);
        
        console.log('✅ Config Module v1.4 ready - Panel will slide in from right');
    }

    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('config-close-btn');
        if (closeBtn) {
            console.log('✅ Close button found, adding listener');
            closeBtn.addEventListener('click', () => this.closePanel());
        } else {
            console.warn('❌ Close button not found');
        }

        // Cancel button
        const cancelBtn = document.getElementById('config-cancel');
        if (cancelBtn) {
            console.log('✅ Cancel button found, adding listener');
            cancelBtn.addEventListener('click', () => {
                console.log('🔄 Cancel button clicked');
                this.returnToChat();
            });
        } else {
            console.warn('❌ Cancel button not found');
        }

        // Save button
        const saveBtn = document.getElementById('config-save');
        if (saveBtn) {
            console.log('✅ Save button found, adding listener');
            saveBtn.addEventListener('click', () => {
                console.log('💾 Save button clicked');
                this.saveConfig();
            });
        } else {
            console.warn('❌ Save button not found');
        }
        
        // Section toggle handlers
        this.setupSectionToggling();
        
        // Model selection change handlers
        this.setupModelChangeHandlers();
        
        // Database branch change handlers
        this.setupDatabaseBranchHandlers();
        
        // Features change handlers
        this.setupFeatureHandlers();
        
        // Personas handlers
        this.setupPersonaHandlers();
    }

    openPanel() {
        const panel = document.getElementById('config-panel');
        if (panel) {
            panel.classList.add('open');
            this.isOpen = true;
            console.log('🔧 Config panel opened');
        }
    }

    closePanel() {
        const panel = document.getElementById('config-panel');
        if (panel) {
            panel.classList.remove('open');
            this.isOpen = false;
            console.log('🔧 Config panel closed');
        }
    }

    saveConfig() {
        console.log('💾 Config save clicked - saving all settings');
        
        // Save model selections to localStorage
        this.saveModelSelections();
        
        // Save database branch selection
        this.saveDatabaseBranch();
        
        // Save features settings
        this.saveFeatures();
        
        // Save personas (if in edit mode, save current edit first)
        if (this.personaEditMode) {
            this.saveCurrentPersonaEdit();
        }
        this.savePersonas();
        
        this.returnToChat();
    }

    async returnToChat() {
        console.log('🔄 Simply closing config panel - chat should stay visible');
        
        // Just close the config panel - no need to reload anything
        this.closePanel();
        
        console.log('✅ Config panel closed, chat remains visible');
    }

    cleanup() {
        // Clean up event listeners and resources
        this.closePanel();
        
        // Remove the config panel from DOM completely
        const panel = document.getElementById('config-panel');
        if (panel) {
            panel.remove();
        }
        
        console.log('🔧 Config Module cleaned up');
    }

    // Method to be called by other modules to open config
    show() {
        this.openPanel();
    }
    
    setupSectionToggling() {
        // Add click handlers for section headers
        const sectionHeaders = document.querySelectorAll('.config-section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.config-section');
                section.classList.toggle('collapsed');
            });
        });
    }
    
    loadModelSelections() {
        // Load model selections from localStorage or set defaults
        try {
            const defaultModel = localStorage.getItem('cfg_default_model') || 'claude-4-sonnet';
            const visionModel = localStorage.getItem('cfg_vision_model') || 'gpt-4o';
            const codeModel = localStorage.getItem('cfg_code_model') || 'claude-4-sonnet';
            const strategyModel = localStorage.getItem('cfg_strategy_model') || 'claude-4-sonnet';
            
            const defaultSelect = document.getElementById('cfg-default-model');
            const visionSelect = document.getElementById('cfg-vision-model');
            const codeSelect = document.getElementById('cfg-code-model');
            const strategySelect = document.getElementById('cfg-strategy-model');
            
            if (defaultSelect) defaultSelect.value = defaultModel;
            if (visionSelect) visionSelect.value = visionModel;
            if (codeSelect) codeSelect.value = codeModel;
            if (strategySelect) strategySelect.value = strategyModel;
            
            console.log('📋 Loaded model selections:', {
                default: defaultModel,
                vision: visionModel,
                code: codeModel,
                strategy: strategyModel
            });
        } catch (error) {
            console.warn('⚠️ Failed to load model selections:', error);
        }
    }
    
    saveModelSelections() {
        // Save current model selections to localStorage
        try {
            const defaultModel = document.getElementById('cfg-default-model')?.value;
            const visionModel = document.getElementById('cfg-vision-model')?.value;
            const codeModel = document.getElementById('cfg-code-model')?.value;
            const strategyModel = document.getElementById('cfg-strategy-model')?.value;
            
            if (defaultModel) localStorage.setItem('cfg_default_model', defaultModel);
            if (visionModel) localStorage.setItem('cfg_vision_model', visionModel);
            if (codeModel) localStorage.setItem('cfg_code_model', codeModel);
            if (strategyModel) localStorage.setItem('cfg_strategy_model', strategyModel);
            
            console.log('💾 Saved model selections:', {
                default: defaultModel,
                vision: visionModel,
                code: codeModel,
                strategy: strategyModel
            });
        } catch (error) {
            console.warn('⚠️ Failed to save model selections:', error);
        }
    }
    
    setupModelChangeHandlers() {
        // Add change listeners for automatic saving
        const modelSelects = ['cfg-default-model', 'cfg-vision-model', 'cfg-code-model', 'cfg-strategy-model'];
        
        modelSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', (e) => {
                    const modelType = selectId.replace('cfg-', '').replace('-model', '');
                    console.log(`🤖 ${modelType} model changed to:`, e.target.value);
                    
                    // Save immediately when changed
                    localStorage.setItem(selectId.replace('-', '_'), e.target.value);
                });
            }
        });
    }
    
    loadDatabaseBranch() {
        // Load database branch selection from localStorage or set default
        try {
            const savedBranch = localStorage.getItem('cfg_database_branch') || 'main';
            const branchSelect = document.getElementById('cfg-database-branch');
            
            if (branchSelect) {
                branchSelect.value = savedBranch;
                this.updateBranchStatus(savedBranch);
                console.log('✅ Database branch dropdown loaded successfully:', savedBranch);
            } else {
                console.error('❌ cfg-database-branch element not found in DOM');
            }
            
            console.log('📋 Loaded database branch:', savedBranch);
        } catch (error) {
            console.warn('⚠️ Failed to load database branch:', error);
        }
    }
    
    saveDatabaseBranch() {
        // Save current database branch selection to localStorage
        try {
            const branchSelect = document.getElementById('cfg-database-branch');
            if (branchSelect && branchSelect.value) {
                localStorage.setItem('cfg_database_branch', branchSelect.value);
                console.log('💾 Saved database branch:', branchSelect.value);
            }
        } catch (error) {
            console.warn('⚠️ Failed to save database branch:', error);
        }
    }
    
    updateBranchStatus(branchValue) {
        // Update branch status display with color coding
        const statusDisplay = document.getElementById('branch-status-display');
        const statusText = document.getElementById('branch-status-text');
        
        if (!statusDisplay || !statusText) return;
        
        // Remove existing classes
        statusDisplay.classList.remove('production', 'testing');
        
        if (branchValue === 'main') {
            statusDisplay.classList.add('production');
            statusText.textContent = 'Production - Clean environment';
        } else {
            statusDisplay.classList.add('testing');
            statusText.textContent = 'Testing - Safe for experiments';
        }
        
        console.log('🌿 Updated branch status:', branchValue);
    }
    
    setupDatabaseBranchHandlers() {
        // Add change listener for database branch dropdown
        const branchSelect = document.getElementById('cfg-database-branch');
        
        if (branchSelect) {
            branchSelect.addEventListener('change', (e) => {
                console.log('🌿 Database branch changed to:', e.target.value);
                
                // Update visual status immediately
                this.updateBranchStatus(e.target.value);
                
                // Save immediately when changed
                localStorage.setItem('cfg_database_branch', e.target.value);
            });
        }
    }
    
    loadFeatures() {
        // Load features settings from localStorage or set defaults
        try {
            const showToasts = localStorage.getItem('cfg_show_toasts') !== 'false'; // Default to true
            const visionAuto = localStorage.getItem('cfg_vision_auto') !== 'false'; // Default to true
            
            const showToastsCheckbox = document.getElementById('cfg-show-toasts');
            const visionAutoCheckbox = document.getElementById('cfg-vision-auto');
            
            if (showToastsCheckbox) showToastsCheckbox.checked = showToasts;
            if (visionAutoCheckbox) visionAutoCheckbox.checked = visionAuto;
            
            console.log('📋 Loaded features settings:', {
                showToasts: showToasts,
                visionAuto: visionAuto
            });
        } catch (error) {
            console.warn('⚠️ Failed to load features:', error);
        }
    }
    
    saveFeatures() {
        // Save current features settings to localStorage
        try {
            const showToastsCheckbox = document.getElementById('cfg-show-toasts');
            const visionAutoCheckbox = document.getElementById('cfg-vision-auto');
            
            if (showToastsCheckbox) {
                localStorage.setItem('cfg_show_toasts', showToastsCheckbox.checked);
            }
            if (visionAutoCheckbox) {
                localStorage.setItem('cfg_vision_auto', visionAutoCheckbox.checked);
            }
            
            console.log('💾 Saved features settings:', {
                showToasts: showToastsCheckbox?.checked,
                visionAuto: visionAutoCheckbox?.checked
            });
        } catch (error) {
            console.warn('⚠️ Failed to save features:', error);
        }
    }
    
    setupFeatureHandlers() {
        // Add change listeners for feature toggles
        const featureCheckboxes = ['cfg-show-toasts', 'cfg-vision-auto'];
        
        featureCheckboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const featureName = checkboxId.replace('cfg-', '').replace('-', '_');
                    console.log(`⚙️ Feature ${featureName} changed to:`, e.target.checked);
                    
                    // Save immediately when changed
                    localStorage.setItem(checkboxId.replace('-', '_'), e.target.checked);
                });
            }
        });
    }
    
    // === PERSONA MANAGEMENT METHODS ===
    
    getDefaultPersonas() {
        // Default personas from Chat v10.4
        return [
            { 
                key: 'dev_assistant', 
                label: 'Developer Assistant', 
                content: 'You are a concise developer assistant. Return the smallest correct answer. Prefer code-only when obvious. No flourish. For procedural instructions, use numbered lists by default.', 
                active: true,
                __isDefault: true
            },
            { 
                key: 'biz_analyst', 
                label: 'Business Analyst', 
                content: 'You are a concise business analyst. Answer in brief bullets. No fluff. Use the user\'s terms. For step-by-step processes, use numbered lists by default.', 
                active: true,
                __isDefault: true
            },
            { 
                key: 'facts_extractor', 
                label: 'Facts Extractor', 
                content: 'You extract terse facts. Only verifiable statements. Respond minimally. For procedural content, default to numbered lists.', 
                active: true,
                __isDefault: true
            }
        ];
    }
    
    loadCustomPersonas() {
        // Load custom personas from localStorage
        try {
            const stored = localStorage.getItem('custom_personas_v1');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('⚠️ Failed to load custom personas:', error);
            return [];
        }
    }
    
    savePersonas() {
        // Save custom personas to localStorage
        try {
            const customs = this.loadCustomPersonas();
            localStorage.setItem('custom_personas_v1', JSON.stringify(customs));
            console.log('💾 Saved personas to localStorage');
        } catch (error) {
            console.warn('⚠️ Failed to save personas:', error);
        }
    }
    
    getAllPersonas() {
        // Merge defaults + customs, filter active
        const defaults = this.getDefaultPersonas();
        const customs = this.loadCustomPersonas();
        
        // Create a map to track all personas
        const personaMap = new Map();
        
        // Add defaults first
        defaults.forEach(p => personaMap.set(p.key, p));
        
        // Override/add customs
        customs.forEach(p => personaMap.set(p.key, p));
        
        // Return only active personas
        return Array.from(personaMap.values()).filter(p => p.active);
    }
    
    loadPersonas() {
        // Load personas and render the list view
        try {
            this.renderPersonaList();
            console.log('📋 Loaded personas and rendered list');
        } catch (error) {
            console.warn('⚠️ Failed to load personas:', error);
        }
    }
    
    renderPersonaList() {
        // Render the persona list view
        const personaList = document.getElementById('persona-list');
        if (!personaList) {
            console.error('❌ persona-list element not found');
            return;
        }
        
        const personas = this.getAllPersonas();
        
        personaList.innerHTML = personas.map(persona => `
            <div class="persona-item" data-key="${persona.key}">
                <div class="persona-item-info">
                    <div class="persona-item-name">${persona.label}</div>
                    <div class="persona-item-key">${persona.key}</div>
                </div>
                <div class="persona-item-badge ${persona.__isDefault ? 'default' : 'custom'}">
                    ${persona.__isDefault ? 'Default' : 'Custom'}
                </div>
            </div>
        `).join('');
        
        console.log('👤 Rendered persona list with', personas.length, 'personas');
    }
    
    setupPersonaHandlers() {
        // Set up persona-related event handlers
        
        // Add persona button
        const addBtn = document.getElementById('persona-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.editPersona(null); // null = new persona
            });
        }
        
        // Edit persona buttons (delegated event handling)
        const personaList = document.getElementById('persona-list');
        if (personaList) {
            personaList.addEventListener('click', (e) => {
                const personaItem = e.target.closest('.persona-item');
                if (personaItem) {
                    const key = personaItem.dataset.key;
                    this.editPersona(key);
                }
            });
        }
        
        // Edit view buttons
        const saveBtn = document.getElementById('persona-save-btn');
        const cancelBtn = document.getElementById('persona-cancel-btn');
        const deleteBtn = document.getElementById('persona-delete-btn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentPersonaEdit();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelPersonaEdit();
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteCurrentPersona();
            });
        }
    }
    
    editPersona(key) {
        // Switch to edit view for the specified persona (or new if key is null)
        this.personaEditMode = true;
        
        // Hide list view, show edit view
        const listView = document.getElementById('persona-list-view');
        const editView = document.getElementById('persona-edit-view');
        
        if (listView) listView.style.display = 'none';
        if (editView) editView.style.display = 'block';
        
        // Populate form
        if (key) {
            // Editing existing persona
            const personas = this.getAllPersonas();
            const persona = personas.find(p => p.key === key);
            
            if (persona) {
                this.editingPersona = persona;
                document.getElementById('persona-edit-title').textContent = `Edit Persona: ${persona.label}`;
                document.getElementById('persona-key').value = persona.key;
                document.getElementById('persona-label').value = persona.label;
                document.getElementById('persona-content').value = persona.content;
                
                // Show delete button for custom personas
                const deleteBtn = document.getElementById('persona-delete-btn');
                if (deleteBtn) {
                    deleteBtn.style.display = persona.__isDefault ? 'none' : 'inline-block';
                }
                
                // Disable key editing for default personas
                const keyInput = document.getElementById('persona-key');
                if (keyInput) {
                    keyInput.disabled = persona.__isDefault;
                }
            }
        } else {
            // Creating new persona
            this.editingPersona = null;
            document.getElementById('persona-edit-title').textContent = 'Add New Persona';
            document.getElementById('persona-key').value = '';
            document.getElementById('persona-label').value = '';
            document.getElementById('persona-content').value = '';
            
            // Hide delete button, enable key editing
            const deleteBtn = document.getElementById('persona-delete-btn');
            if (deleteBtn) deleteBtn.style.display = 'none';
            
            const keyInput = document.getElementById('persona-key');
            if (keyInput) keyInput.disabled = false;
        }
        
        console.log('👤 Switched to edit mode for persona:', key || 'new');
    }
    
    saveCurrentPersonaEdit() {
        // Save the current persona being edited
        try {
            const key = document.getElementById('persona-key').value.trim();
            const label = document.getElementById('persona-label').value.trim();
            const content = document.getElementById('persona-content').value.trim();
            
            // Validation
            if (!key || !label || !content) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Key validation (alphanumeric + underscores only)
            if (!/^[a-z0-9_]+$/.test(key)) {
                this.showNotification('Key must contain only lowercase letters, numbers, and underscores', 'error');
                return;
            }
            
            const customs = this.loadCustomPersonas();
            const existingIndex = customs.findIndex(p => p.key === key);
            
            // Check for key conflicts with defaults (only for new personas)
            if (!this.editingPersona) {
                const allPersonas = this.getAllPersonas();
                const keyExists = allPersonas.some(p => p.key === key);
                if (keyExists) {
                    this.showNotification('A persona with this key already exists', 'error');
                    return;
                }
            }
            
            const persona = {
                key,
                label,
                content,
                active: true,
                __isDefault: false
            };
            
            const isNewPersona = !this.editingPersona;
            
            if (existingIndex >= 0) {
                // Update existing custom persona
                customs[existingIndex] = persona;
            } else {
                // Add new custom persona
                customs.push(persona);
            }
            
            // Save to localStorage
            localStorage.setItem('custom_personas_v1', JSON.stringify(customs));
            
            // Return to list view
            this.cancelPersonaEdit();
            this.renderPersonaList();
            
            // Show success message
            const message = isNewPersona ? 
                `Persona "${label}" created successfully` : 
                `Persona "${label}" updated successfully`;
            this.showNotification(message, 'success');
            
            console.log('💾 Saved persona:', persona);
            
        } catch (error) {
            console.error('❌ Failed to save persona:', error);
            this.showNotification('Failed to save persona. Please try again.', 'error');
        }
    }
    
    cancelPersonaEdit() {
        // Cancel editing and return to list view
        this.personaEditMode = false;
        this.editingPersona = null;
        
        // Show list view, hide edit view
        const listView = document.getElementById('persona-list-view');
        const editView = document.getElementById('persona-edit-view');
        
        if (listView) listView.style.display = 'block';
        if (editView) editView.style.display = 'none';
        
        console.log('👤 Cancelled persona edit, returned to list view');
    }
    
    deleteCurrentPersona() {
        // Delete the current persona being edited
        if (!this.editingPersona || this.editingPersona.__isDefault) {
            this.showNotification('Cannot delete default personas', 'error');
            return;
        }
        
        // Use custom confirmation dialog
        this.showConfirmation(
            `Are you sure you want to delete the persona "${this.editingPersona.label}"?`,
            () => {
                // Confirmed - proceed with deletion
                try {
                    const customs = this.loadCustomPersonas();
                    const originalLength = customs.length;
                    const personaKey = this.editingPersona.key;
                    const deletedPersonaName = this.editingPersona.label;
                    
                    const filtered = customs.filter(p => p.key !== personaKey);
                    
                    if (filtered.length >= originalLength) {
                        // No persona was removed
                        this.showNotification('Persona not found', 'error');
                        return;
                    }
                    
                    localStorage.setItem('custom_personas_v1', JSON.stringify(filtered));
                    
                    // Return to list view
                    this.cancelPersonaEdit();
                    this.renderPersonaList();
                    
                    // Show success message
                    this.showNotification(`Persona "${deletedPersonaName}" deleted successfully`, 'success');
                    
                    console.log('🗑️ Deleted persona:', personaKey);
                    
                } catch (error) {
                    console.error('❌ Failed to delete persona:', error);
                    this.showNotification('Failed to delete persona. Please try again.', 'error');
                }
            }
        );
    }
    
    // === CUSTOM NOTIFICATION METHODS ===
    
    showNotification(message, type = 'info') {
        // Create custom styled notification instead of alert()
        const notification = document.createElement('div');
        notification.className = `config-notification config-notification-${type}`;
        notification.innerHTML = `
            <div class="config-notification-content">
                <span class="config-notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="config-notification-message">${message}</span>
                <button class="config-notification-close">&times;</button>
            </div>
        `;
        
        // Add to config panel
        const configPanel = document.getElementById('config-panel');
        if (configPanel) {
            configPanel.appendChild(notification);
            
            // Auto-remove after 4 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 4000);
            
            // Close button handler
            const closeBtn = notification.querySelector('.config-notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    notification.remove();
                });
            }
        }
    }
    
    showConfirmation(message, onConfirm, onCancel = null) {
        // Create custom styled confirmation dialog instead of confirm()
        const overlay = document.createElement('div');
        overlay.className = 'config-confirmation-overlay';
        overlay.innerHTML = `
            <div class="config-confirmation-dialog">
                <div class="config-confirmation-content">
                    <div class="config-confirmation-icon">⚠️</div>
                    <div class="config-confirmation-message">${message}</div>
                    <div class="config-confirmation-actions">
                        <button class="config-btn config-cancel" id="confirm-cancel">Cancel</button>
                        <button class="config-btn config-delete" id="confirm-ok">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Event handlers
        const okBtn = overlay.querySelector('#confirm-ok');
        const cancelBtn = overlay.querySelector('#confirm-cancel');
        
        const cleanup = () => {
            overlay.remove();
        };
        
        if (okBtn) {
            okBtn.addEventListener('click', () => {
                cleanup();
                if (onConfirm) onConfirm();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                cleanup();
                if (onCancel) onCancel();
            });
        }
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                if (onCancel) onCancel();
            }
        });
    }
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info':
            default: return 'ℹ️';
        }
    }
}