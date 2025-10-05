/**
 * CONFIG MODULE v1.1 - Bob AI Platform Configuration Interface
 * BITE #3: Database Branch Selection Integration
 * 
 * NEW IN v1.1: Database Branch section with visual status indicators
 * INCLUDES: Model Selection (Bite #2) + Database Branch (Bite #3)
 * 
 * Features:
 * - Fixed-position slide-out panel from right side
 * - Model Selection: 4 AI model types with localStorage persistence
 * - Database Branch: Production vs Testing branch selection
 * - Save/Cancel workflow with chat integration
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
                appearance: auto !important;
                -webkit-appearance: menulist !important;
                -moz-appearance: menulist !important;
                cursor: pointer;
            }
            
            .config-item select:focus {
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
            
            // Auto-open the config panel
            this.openPanel();
        }, 500);
        
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
        
        // Database branch change handlers
        this.setupDatabaseBranchHandlers();
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
        
        // Save database branch selection
        this.saveDatabaseBranch();
        
        this.returnToChat();
    }

    async returnToChat() {
        console.log('🔄 Simply closing config panel - chat should stay visible');
        
        // Just close the config panel - no need to reload anything
        this.closePanel();
        
        console.log('✅ Config panel closed, chat remains visible');
        return; // Exit early, no complex logic needed
        
        // Detect current state - are we on fresh start or loaded project?
        const chatContainer = document.getElementById('chat');
        const hasConversation = chatContainer && chatContainer.children.length > 0;
        const mainContentArea = document.querySelector('.main-content, #main-content, .content-area');
        
        console.log('🔍 Chat state:', {
            hasConversation,
            chatContainer: !!chatContainer,
            mainContentArea: !!mainContentArea,
            chatChildren: chatContainer?.children.length || 0
        });
        
        // Close the config panel first
        this.closePanel();
        
        // Wait for panel to close completely
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remove the config panel from DOM completely
        const panel = document.getElementById('config-panel');
        if (panel) {
            panel.remove();
            console.log('🗑️ Config panel removed from DOM');
        }
        
        // Clear any overlays aggressively
        const overlaySelectors = [
            '[id*="progress"]', '[class*="progress"]', '[class*="loading"]', '[class*="overlay"]',
            '.modal', '.message-overlay', '.system-message', '[class*="modal"]', 
            '[style*="position: fixed"]', '[style*="position: absolute"]'
        ];
        
        overlaySelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (el && el.id !== 'chat' && !el.className.includes('nav')) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.zIndex = '-1000';
                }
            });
        });
        
        // Ensure navigation bar stays visible and properly sized (Scenario 1 fix)
        const navBar = document.querySelector('nav, .navbar, .navigation, .nav-bar, .header-nav');
        if (navBar) {
            navBar.style.display = 'flex';
            navBar.style.visibility = 'visible';
            navBar.style.position = 'relative';
            navBar.style.zIndex = '100';
            navBar.style.width = '100%';
            navBar.style.overflow = 'visible';
            navBar.style.flexWrap = 'nowrap';
            
            // Ensure all nav items are visible
            const navItems = navBar.querySelectorAll('.nav-item, .dropdown, [class*="nav-"]');
            navItems.forEach(item => {
                if (item.style) {
                    item.style.display = 'block';
                    item.style.visibility = 'visible';
                    item.style.opacity = '1';
                }
            });
            
            console.log('✅ Navigation bar visibility and layout ensured');
            console.log('🔍 Nav items found:', navItems.length);
        }
        
        if (hasConversation) {
            // Scenario 2: We have a loaded conversation - need to reload chat module properly
            console.log('🔄 Scenario 2: Reloading chat module with existing conversation');
            
            // CRITICAL FIX: Properly reload the chat module using the module loader
            if (window.bobAiModuleLoader) {
                window.bobAiModuleLoader.loadModule('chat', 'interface');
                console.log('✅ Chat module reloaded via module loader for Scenario 2');
            } else {
                console.warn('⚠️ Module loader not available for Scenario 2');
            }
            
            // Aggressively remove the brown/golden overlay that's covering chat
            const coloredOverlays = document.querySelectorAll('*');
            coloredOverlays.forEach(el => {
                const style = window.getComputedStyle(el);
                const bgColor = style.backgroundColor;
                
                // Look for brown/golden colored overlays
                if (bgColor.includes('rgb(') && 
                    (bgColor.includes('139, 111, 69') || // Common brown
                     bgColor.includes('184, 134, 11') || // Golden brown
                     bgColor.includes('180, 83, 9') ||   // Orange brown
                     bgColor.includes('146, 64, 14') ||  // Dark brown
                     el.style.background.includes('linear-gradient') ||
                     el.style.background.includes('radial-gradient'))) {
                    
                    console.log('🗑️ Removing colored overlay:', {
                        element: el.tagName,
                        id: el.id,
                        className: el.className,
                        backgroundColor: bgColor
                    });
                    
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.zIndex = '-1000';
                    el.remove(); // Completely remove problematic overlays
                }
            });
            
            // Also remove any large positioned elements that might be the overlay
            const largeElements = document.querySelectorAll('*');
            largeElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                
                // Remove large positioned elements that could be overlays
                if ((style.position === 'fixed' || style.position === 'absolute') &&
                    rect.width > window.innerWidth * 0.8 &&
                    rect.height > window.innerHeight * 0.5 &&
                    !el.id.includes('chat') && !el.className.includes('nav')) {
                    
                    console.log('🗑️ Removing large overlay element:', {
                        element: el.tagName,
                        id: el.id,
                        className: el.className,
                        width: rect.width,
                        height: rect.height
                    });
                    
                    el.remove();
                }
            });
            
            // Don't reload module, just clean up and restore visibility
            if (chatContainer) {
                chatContainer.style.display = 'block';
                chatContainer.style.visibility = 'visible';
                chatContainer.style.opacity = '1';
                chatContainer.style.zIndex = '1000'; // Higher z-index
                chatContainer.style.position = 'relative';
                chatContainer.style.background = '#ffffff'; // Ensure white background
            }
            if (mainContentArea) {
                mainContentArea.style.display = 'block';
                mainContentArea.style.visibility = 'visible';
                mainContentArea.style.zIndex = '999';
                mainContentArea.style.position = 'relative';
                mainContentArea.style.background = '#ffffff';
            }
            
            console.log('✅ Conversation visibility restored with overlay removal');
            
        } else {
            // Scenario 1: Fresh start - need to properly load chat module
            console.log('🔄 Scenario 1: Loading chat module for fresh start');
            
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
                
                // Extra cleanup after chat loads (Scenario 1 only)
                setTimeout(() => {
                    // Ensure navigation stays visible and properly laid out
                    const navBarAgain = document.querySelector('nav, .navbar, .navigation, .nav-bar, .header-nav');
                    if (navBarAgain) {
                        navBarAgain.style.display = 'flex';
                        navBarAgain.style.visibility = 'visible';
                        navBarAgain.style.width = '100%';
                        navBarAgain.style.overflow = 'visible';
                        navBarAgain.style.flexWrap = 'nowrap';
                        
                        // Force all nav items to be visible again
                        const allNavItems = navBarAgain.querySelectorAll('.nav-item, .dropdown, [class*="nav-"]');
                        allNavItems.forEach(item => {
                            if (item.style) {
                                item.style.display = 'inline-block';
                                item.style.visibility = 'visible';
                                item.style.opacity = '1';
                            }
                        });
                        
                        console.log('🔄 Navigation re-ensured:', allNavItems.length, 'items');
                    }
                    
                    // Ensure chat content is visible
                    const freshChatContainer = document.getElementById('chat');
                    const freshMainContent = document.querySelector('.main-content');
                    if (freshChatContainer) {
                        freshChatContainer.style.display = 'block';
                        freshChatContainer.style.visibility = 'visible';
                        freshChatContainer.style.opacity = '1';
                        freshChatContainer.style.zIndex = '1';
                    }
                    if (freshMainContent) {
                        freshMainContent.style.display = 'block';
                        freshMainContent.style.visibility = 'visible';
                        freshMainContent.style.zIndex = '1';
                    }
                    console.log('✅ Fresh start chat visibility ensured');
                }, 500);
                
            } else {
                // Fallback: try to directly load chat module
                console.log('🔄 Fallback: Loading chat module directly');
                if (this.moduleLoader && this.moduleLoader.loadModule) {
                    await this.moduleLoader.loadModule('chat');
                }
            }
        }
        
        // Final cleanup after everything
        setTimeout(() => {
            // Remove any remaining configuration-related overlays
            document.querySelectorAll('[id*="config"], [class*="config"]').forEach(el => {
                if (el.id !== 'config-panel' && el.textContent.includes('Configuration')) {
                    el.remove();
                }
            });
            
            // Debug: Find ALL elements that could be overlays (large positioned elements)
            const allElements = document.querySelectorAll('*');
            console.log('🔍 SCANNING FOR OVERLAY ELEMENTS...');
            
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                const bgColor = style.backgroundColor;
                const bg = style.background;
                
                // Look for large positioned elements OR colored backgrounds
                const isLargePositioned = (style.position === 'fixed' || style.position === 'absolute') &&
                                        rect.width > 500 && rect.height > 300;
                                        
                const hasColoredBackground = bgColor !== 'rgba(0, 0, 0, 0)' && 
                                          bgColor !== 'rgb(255, 255, 255)' && 
                                          bgColor !== 'transparent';
                
                if (isLargePositioned || hasColoredBackground) {
                    console.log('🔍 POTENTIAL OVERLAY ELEMENT:', {
                        element: el.tagName,
                        id: el.id,
                        className: el.className,
                        backgroundColor: bgColor,
                        background: bg,
                        position: style.position,
                        zIndex: style.zIndex,
                        width: rect.width,
                        height: rect.height,
                        visible: rect.width > 0 && rect.height > 0
                    });
                    
                    // If it's a large positioned element that's not chat-related, remove it
                    if (isLargePositioned && 
                        !el.id.includes('chat') && 
                        !el.className.includes('nav') &&
                        !el.className.includes('chat')) {
                        console.log('🗑️ REMOVING LARGE OVERLAY:', el.tagName, el.id, el.className);
                        el.remove();
                    }
                }
            });
            
            console.log('🔄 returnToChat process completed');
        }, 1000);
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
            
            console.log('🔍 Debug - loadDatabaseBranch:', {
                savedBranch,
                branchSelect,
                elementExists: !!branchSelect,
                tagName: branchSelect?.tagName,
                type: branchSelect?.type,
                disabled: branchSelect?.disabled,
                readOnly: branchSelect?.readOnly
            });
            
            if (branchSelect) {
                // Debug: Check what options are actually in the dropdown
                const options = branchSelect.querySelectorAll('option');
                console.log('🔍 Dropdown options count:', options.length);
                Array.from(options).forEach((opt, index) => {
                    console.log(`🔍 Option ${index + 1}:`, {
                        value: opt.value,
                        text: opt.textContent,
                        selected: opt.selected
                    });
                });
                
                // Force all options to be visible
                Array.from(options).forEach(option => {
                    option.style.display = 'block';
                    option.style.visibility = 'visible';
                    option.style.opacity = '1';
                });
                
                branchSelect.value = savedBranch;
                this.updateBranchStatus(savedBranch);
                console.log('✅ Database branch dropdown loaded successfully:', savedBranch);
                
                // Debug: Check dropdown after setting value
                console.log('🔍 Selected option:', branchSelect.selectedOptions[0]?.textContent);
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
}