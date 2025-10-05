/**
 * BOB AI PLATFORM - MODULAR LOADING SYSTEM
 * 
 * Dynamic module loader supporting ES6 imports, URL routing,
 * and shared state management for the Bob AI Platform.
 * 
 * Author: Worker #4 - Modular UI Container Development
 * Based on: BuilderTrend professional interface model
 */

class ModuleLoader {
    constructor() {
        this.currentModule = null;
        this.moduleCache = new Map();
        this.sharedState = {
            currentUser: 'Bob AI User',
            currentProject: null,
            sessionId: null,
            ragSessionId: null,
            projectId: null,
            systemStatus: 'online',
            notifications: [],
            currentTheme: 'light'
        };
        this.eventListeners = new Map();
        this.moduleContainer = null;
        this.loadingIndicator = null;
    }

    /**
     * Initialize the module loader system
     */
    init() {
        this.moduleContainer = document.getElementById('module-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        if (!this.moduleContainer) {
            console.error('Module container not found');
            return;
        }

        // Set up navigation event handlers
        this.setupNavigationHandlers();
        
        // Set up URL routing
        this.setupUrlRouting();
        
        // Restore state from session storage
        this.restoreState();
        
        // Set up periodic state persistence
        this.setupStatePersistence();
        
        // Set up automatic theme detection
        this.setupThemeDetection();

        console.log('ModuleLoader initialized successfully');
    }

    /**
     * Set up navigation click handlers for dropdown items
     */
    setupNavigationHandlers() {
        // Handle navigation button clicks
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const navItem = button.closest('.nav-item');
                const moduleId = navItem.dataset.module;
                
                if (moduleId) {
                    this.loadModule(moduleId);
                    this.updateActiveNavigation(button);
                }
            });
        });

        // Handle dropdown item clicks
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const navItem = item.closest('.nav-item');
                const moduleId = navItem ? navItem.dataset.module : null;
                const subModule = item.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                
                if (moduleId) {
                    this.loadModule(moduleId, subModule);
                    this.updateActiveNavigation(navItem.querySelector('.nav-button'));
                }
            });
        });
    }

    /**
     * Set up URL routing for direct module access
     */
    setupUrlRouting() {
        // Handle browser back/forward navigation
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.module) {
                this.loadModule(e.state.module, e.state.subModule, false);
            }
        });

        // Parse initial URL
        const urlParams = new URLSearchParams(window.location.search);
        const module = urlParams.get('module');
        const subModule = urlParams.get('sub');
        
        if (module) {
            this.loadModule(module, subModule, false);
        }
    }

    /**
     * Set up state persistence to session storage
     */
    setupStatePersistence() {
        // Save state every 30 seconds
        setInterval(() => {
            this.saveState();
        }, 30000);

        // Save state on page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }

    /**
     * Set up automatic Windows 11 theme detection
     */
    setupThemeDetection() {
        // Check for system theme preference support
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Initial theme detection
            this.applyTheme(darkModeQuery.matches ? 'dark' : 'light');
            
            // Listen for system theme changes
            darkModeQuery.addEventListener('change', (e) => {
                this.applyTheme(e.matches ? 'dark' : 'light');
                console.log(`Theme automatically switched to: ${e.matches ? 'dark' : 'light'} mode`);
            });
            
            console.log('Windows 11 automatic theme detection enabled');
        } else {
            console.warn('System theme detection not supported in this browser');
        }
    }

    /**
     * Apply theme to the document
     */
    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
        
        // Update shared state
        this.setState({ currentTheme: theme });
    }

    /**
     * Update active navigation visual state
     */
    updateActiveNavigation(activeButton) {
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to current button
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'flex';
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Load a module dynamically
     * @param {string} moduleId - The module identifier
     * @param {string} subModule - Optional sub-module identifier
     * @param {boolean} updateUrl - Whether to update browser URL
     */
    async loadModule(moduleId, subModule = null, updateUrl = true) {
        try {
            this.showLoading();
            console.log(`Loading module: ${moduleId}${subModule ? `/${subModule}` : ''}`);

            // Check cache first
            const cacheKey = `${moduleId}${subModule ? `-${subModule}` : ''}`;
            let moduleInstance;

            if (this.moduleCache.has(cacheKey)) {
                moduleInstance = this.moduleCache.get(cacheKey);
                console.log(`Module loaded from cache: ${cacheKey}`);
            } else {
                // Load module file with cache busting for specific modules
                const timestamp = new Date().getTime();
                let modulePath;
                let moduleVersion = 'unknown';

                if (moduleId === 'chat') {
                    modulePath = `modules/${moduleId}/${moduleId}-v1.4.4.js?v=${timestamp}`;
                } else if (moduleId === 'config') {
                    modulePath = `modules/${moduleId}/${moduleId}-v1.7.js?v=${timestamp}`;
                } else {
                    modulePath = `modules/${moduleId}/${moduleId}.js`;
                }

                // Extract version from module path (e.g., "chat-v1.4.4.js" -> "v1.4.4")
                const versionMatch = modulePath.match(/(v[\d.]+)/);
                if (versionMatch) {
                    moduleVersion = versionMatch[1];
                }

                try {
                    // Import the module
                    const module = await import(`./${modulePath}`);

                    // Create module instance and pass version info
                    const ModuleClass = module.default || module[Object.keys(module)[0]];
                    moduleInstance = new ModuleClass(this.sharedState, this);

                    // Store version in shared state for module to access
                    this.sharedState.moduleVersion = moduleVersion;
                    
                    // Cache the module
                    this.moduleCache.set(cacheKey, moduleInstance);
                    console.log(`Module loaded and cached: ${cacheKey}`);
                    
                } catch (importError) {
                    console.warn(`Failed to import module ${modulePath}, falling back to inline module`);
                    
                    // Fallback to inline module creation
                    moduleInstance = this.createInlineModule(moduleId, subModule);
                    this.moduleCache.set(cacheKey, moduleInstance);
                }
            }

            // Special handling for config module - don't clear existing content
            if (moduleId === 'config') {
                console.log('🔧 Config module - keeping existing content visible');
                // Don't cleanup or clear for config - it's just an overlay
            } else {
                // Cleanup previous module
                if (this.currentModule && this.currentModule.cleanup) {
                    this.currentModule.cleanup();
                }

                // Clear container
                this.moduleContainer.innerHTML = '';
            }

            // Initialize new module
            if (moduleInstance.init) {
                await moduleInstance.init(subModule);
            }

            // Render module
            if (moduleInstance.render) {
                const content = moduleInstance.render();
                if (moduleId === 'config') {
                    // Config module handles its own rendering (slide-out panel)
                    console.log('🔧 Config module renders its own panel');
                } else {
                    // Regular modules render into the main container
                    if (typeof content === 'string') {
                        this.moduleContainer.innerHTML = content;
                    } else if (content instanceof HTMLElement) {
                        this.moduleContainer.appendChild(content);
                    }
                }
            }

            // Post-render setup
            if (moduleInstance.postRender) {
                await moduleInstance.postRender();
            }

            // Store reference (but don't replace currentModule for config)
            if (moduleId !== 'config') {
                this.currentModule = moduleInstance;
            } else {
                // For config, just store it separately and keep the current module active
                this.configModule = moduleInstance;
                console.log('🔧 Config module stored separately, current module preserved');
            }

            // Update URL if requested
            if (updateUrl) {
                const url = new URL(window.location);
                url.searchParams.set('module', moduleId);
                if (subModule) {
                    url.searchParams.set('sub', subModule);
                } else {
                    url.searchParams.delete('sub');
                }
                
                window.history.pushState(
                    { module: moduleId, subModule },
                    `${moduleId} - Bob AI Platform`,
                    url.toString()
                );
            }

            this.hideLoading();
            console.log(`Module loaded successfully: ${cacheKey}`);

        } catch (error) {
            console.error(`Failed to load module ${moduleId}:`, error);
            this.showErrorModule(moduleId, error);
            this.hideLoading();
        }
    }

    /**
     * Create inline module when import fails
     */
    createInlineModule(moduleId, subModule) {
        return {
            id: moduleId,
            subModule: subModule,
            init: async function() {
                console.log(`Initialized inline module: ${this.id}`);
            },
            render: function() {
                return this.getDefaultContent();
            },
            getDefaultContent: function() {
                const title = this.id.charAt(0).toUpperCase() + this.id.slice(1);
                return `
                    <div style="padding: 2rem; text-align: center;">
                        <h2 style="color: #0078d4; margin-bottom: 1rem;">${title} Module</h2>
                        <p style="color: #666; margin-bottom: 2rem;">This is the ${title.toLowerCase()} module container.</p>
                        ${this.subModule ? `<p style="color: #999; font-size: 0.9em;">Sub-module: ${this.subModule}</p>` : ''}
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
                            <h3 style="color: #333; margin-bottom: 1rem;">Module Features</h3>
                            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                                ${this.getFeatureList()}
                            </ul>
                        </div>
                        <button onclick="ModuleLoader.showInfo('${this.id}')" 
                                style="background: #0078d4; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                            Learn More
                        </button>
                    </div>
                `;
            },
            getFeatureList: function() {
                const features = {
                    dashboard: ['Project Overview', 'Recent Activity', 'Quick Actions', 'Performance Metrics'],
                    sales: ['Lead Management', 'Prospect Tracking', 'Estimate Creation', 'Proposal Generation'],
                    jobs: ['Active Projects', 'Project Scheduling', 'Progress Tracking', 'Completion Reports'],
                    'project-management': ['Task Management', 'Team Coordination', 'Resource Planning', 'Quality Control'],
                    documents: ['File Management', 'Contract Storage', 'Photo Gallery', 'Plans & Specifications'],
                    chat: ['AI Assistant', 'Document Analysis', 'Project Insights', 'Workflow Automation'],
                    financial: ['Budget Management', 'Cost Tracking', 'Invoice Generation', 'Financial Reports'],
                    reports: ['Project Analytics', 'Performance Reports', 'Custom Dashboards', 'Data Export']
                };
                
                const moduleFeatures = features[this.id] || ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'];
                return moduleFeatures.map(feature => `<li style="margin: 0.5rem 0;">${feature}</li>`).join('');
            }
        };
    }

    /**
     * Show error module when loading fails
     */
    showErrorModule(moduleId, error) {
        const errorContent = `
            <div style="padding: 2rem; text-align: center; color: #f44336;">
                <h2>Module Loading Error</h2>
                <p>Failed to load module: <strong>${moduleId}</strong></p>
                <p style="font-size: 0.9em; color: #666; margin: 1rem 0;">${error.message}</p>
                <button onclick="location.reload()" 
                        style="background: #0078d4; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                    Reload Page
                </button>
            </div>
        `;
        this.moduleContainer.innerHTML = errorContent;
    }

    /**
     * Show module information
     */
    showInfo(moduleId) {
        const info = {
            dashboard: 'The Dashboard provides an overview of all your construction projects, recent activities, and key performance metrics.',
            sales: 'Sales module helps you manage leads, track prospects, create estimates, and generate professional proposals.',
            jobs: 'Jobs module provides comprehensive project management including active projects, scheduling, and progress tracking.',
            'project-management': 'Project Management module offers task management, team coordination, resource planning, and quality control.',
            documents: 'Document management system for storing contracts, photos, plans, specifications, and all project-related files.',
            chat: 'AI Assistant provides intelligent chat interface, document analysis, project insights, and workflow automation.',
            financial: 'Financial module handles budget management, cost tracking, invoice generation, and comprehensive financial reporting.',
            reports: 'Reporting system provides project analytics, performance reports, custom dashboards, and data export capabilities.'
        };

        alert(info[moduleId] || 'Module information not available.');
    }

    /**
     * Get shared state
     */
    getState() {
        return { ...this.sharedState };
    }

    /**
     * Update shared state
     */
    setState(updates) {
        Object.assign(this.sharedState, updates);
        this.saveState();
        this.notifyStateChange(updates);
    }

    /**
     * Save state to session storage
     */
    saveState() {
        try {
            sessionStorage.setItem('bobAiState', JSON.stringify(this.sharedState));
        } catch (error) {
            console.warn('Failed to save state to session storage:', error);
        }
    }

    /**
     * Restore state from session storage
     */
    restoreState() {
        try {
            const saved = sessionStorage.getItem('bobAiState');
            if (saved) {
                const state = JSON.parse(saved);
                Object.assign(this.sharedState, state);
                console.log('State restored from session storage');
            }
        } catch (error) {
            console.warn('Failed to restore state from session storage:', error);
        }
    }

    /**
     * Notify modules of state changes
     */
    notifyStateChange(updates) {
        if (this.currentModule && this.currentModule.onStateChange) {
            this.currentModule.onStateChange(updates);
        }
        
        // Emit custom event for other listeners
        const event = new CustomEvent('bobAiStateChange', {
            detail: { updates, fullState: this.sharedState }
        });
        window.dispatchEvent(event);
    }

    /**
     * Register event listener for module communication
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Emit event to registered listeners
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get current module instance
     */
    getCurrentModule() {
        return this.currentModule;
    }

    /**
     * Refresh current module
     */
    refreshCurrentModule() {
        if (this.currentModule && this.currentModule.refresh) {
            this.currentModule.refresh();
        } else {
            // Reload the module
            const url = new URL(window.location);
            const module = url.searchParams.get('module');
            const subModule = url.searchParams.get('sub');
            if (module) {
                this.loadModule(module, subModule, false);
            }
        }
    }
}

// Create global instance
window.ModuleLoader = new ModuleLoader();

// Export for module imports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}

// Add utility methods to global ModuleLoader
window.ModuleLoader.showInfo = window.ModuleLoader.showInfo.bind(window.ModuleLoader);

// Debug helpers for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.bobAiDebug = {
        getState: () => window.ModuleLoader.getState(),
        setState: (updates) => window.ModuleLoader.setState(updates),
        loadModule: (id, sub) => window.ModuleLoader.loadModule(id, sub),
        getCurrentModule: () => window.ModuleLoader.getCurrentModule(),
        clearCache: () => {
            window.ModuleLoader.moduleCache.clear();
            console.log('Module cache cleared');
        }
    };
    console.log('Bob AI Debug utilities available: window.bobAiDebug');
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize module loader
    window.ModuleLoader.init();
    
    // Load default chat module
    window.ModuleLoader.loadModule('chat');
    
    // Set AI Assistant nav as active by default
    setTimeout(() => {
        const aiAssistantNav = document.querySelector('[data-module="chat"] .nav-button');
        if (aiAssistantNav) {
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            aiAssistantNav.classList.add('active');
        }
    }, 100);
});