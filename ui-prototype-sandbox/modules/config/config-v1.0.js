/**
 * CONFIG MODULE v1.0 - Bob AI Platform Configuration Interface
 * INITIAL VERSION: Basic slide-out panel structure
 * 
 * Extracted from Chat v10.4 configuration system:
 * - Fixed-position slide-out panel from right side
 * - Collapsible sections framework
 * - Save/Cancel workflow structure
 * - Clean modular architecture
 */

export default class ConfigModule {
    constructor(moduleLoader) {
        this.moduleLoader = moduleLoader;
        this.isOpen = false;
    }

    async init() {
        console.log('🔧 Config Module v1.0 initializing...');
        // Module initialization
    }

    render() {
        // Create the slide-out panel as a global overlay (outside main content area)
        this.createConfigPanel();
        
        return `
            <!-- Config Module Content (minimal in main area) -->
            <div class="config-module-content">
                <div class="config-info">
                    <h2>⚙️ Configuration Panel</h2>
                    <p>Configuration panel is now open on the right side of your screen.</p>
                    <p>Make your changes and click "Save Changes" or "Cancel" to return.</p>
                </div>
            </div>
            
            <!-- Config module styles -->
            <style>
                .config-module-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    text-align: center;
                }
                
                .config-info {
                    background: #f8f9fa;
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                    padding: 40px;
                    max-width: 500px;
                    color: #666;
                }
                
                .config-info h2 {
                    margin-top: 0;
                    color: #333;
                }
            </style>
        `;
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
                    <div class="config-section" id="model-section">
                        <div class="config-section-header">
                            <div class="config-section-title">
                                <span class="config-section-icon">🤖</span>
                                Model Selection
                            </div>
                            <span class="config-section-toggle">▼</span>
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
            /* Configuration Panel Styles - Extracted from Chat v10.4 */
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
            
            .config-item select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #ffffff;
                font-size: 14px;
                color: #333;
            }
            
            .config-item select:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }
        `;

        document.head.appendChild(styleElement);
        document.body.insertAdjacentHTML('beforeend', panelHTML);
    }

    async postRender() {
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            // Set up event listeners
            this.setupEventListeners();
            
            // Load saved model selections
            this.loadModelSelections();
            
            // Auto-open the config panel
            this.openPanel();
        }, 200);
        
        console.log('✅ Config Module v1.0 ready - Panel will slide in from right');
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
        console.log('💾 Config save clicked - saving model selections');
        
        // Save model selections to localStorage
        this.saveModelSelections();
        
        this.returnToChat();
    }

    async returnToChat() {
        // Close the config panel first
        this.closePanel();
        
        // Wait for panel to close completely
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remove the config panel from DOM completely
        const panel = document.getElementById('config-panel');
        if (panel) {
            panel.remove();
        }
        
        // Simulate clicking on the Chat Interface dropdown item
        const chatDropdownItems = document.querySelectorAll('.dropdown-item');
        let chatInterfaceItem = null;
        
        for (const item of chatDropdownItems) {
            if (item.textContent.trim() === 'Chat Interface') {
                chatInterfaceItem = item;
                break;
            }
        }
        
        if (chatInterfaceItem) {
            console.log('🔄 Clicking Chat Interface to return to chat');
            chatInterfaceItem.click();
        } else {
            // Fallback: try to directly load chat module
            console.log('🔄 Fallback: Loading chat module directly');
            if (this.moduleLoader && this.moduleLoader.loadModule) {
                await this.moduleLoader.loadModule('chat');
            }
        }
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
}