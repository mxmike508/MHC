/**
 * CHAT MODULE v1.3.1-SIMPLE - Bob AI Platform Main Interface
 * Simplified version with working header integration and version display
 */

// Import from v1.3 as base and just add the UI modifications
import ChatModule from './chat-v1.3.js';

class ChatModuleV131 extends ChatModule {
    constructor(sharedState, moduleLoader) {
        super(sharedState, moduleLoader);
        console.log('🚀 ChatModule v1.3.1-SIMPLE initializing...');
    }

    async postRender() {
        // Call parent postRender first
        await super.postRender();
        
        // Add version display immediately
        this.addVersionDisplay();
        
        // Add header controls if we have a project
        if (this.currentProjectId) {
            this.addHeaderControls();
        }
    }

    switchToChat(projectName) {
        // Call parent method
        super.switchToChat(projectName);
        
        // Add header controls when switching to chat
        this.addHeaderControls();
    }

    switchProject() {
        // Remove header controls
        this.removeHeaderControls();
        
        // Call parent method
        super.switchProject();
    }

    addVersionDisplay() {
        // Remove any existing version display
        const existing = document.getElementById('chat-version-display');
        if (existing) existing.remove();

        // Create new version display
        const versionDisplay = document.createElement('div');
        versionDisplay.id = 'chat-version-display';
        versionDisplay.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            color: red;
            font-size: 0.75rem;
            font-weight: 500;
            z-index: 1000;
            pointer-events: none;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        `;
        versionDisplay.textContent = 'v1.3.1';
        document.body.appendChild(versionDisplay);
        console.log('✅ Version display added: v1.3.1');
    }

    addHeaderControls() {
        if (!this.currentProjectId) return;

        // Remove existing controls
        this.removeHeaderControls();

        const userActions = document.querySelector('.user-actions');
        if (!userActions) {
            console.warn('User actions not found');
            return;
        }

        // Create simple project info
        const projectInfo = document.createElement('div');
        projectInfo.id = 'header-project-info';
        projectInfo.style.cssText = `
            color: #0078d4;
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-right: 8px;
            border: 1px solid #0078d4;
        `;
        
        const projectName = document.getElementById('currentProjectName')?.textContent || 'Active Project';
        projectInfo.textContent = projectName;

        // Create action buttons
        const actionButtons = document.createElement('div');
        actionButtons.id = 'header-action-buttons';
        actionButtons.style.cssText = 'display: flex; gap: 4px; margin-right: 8px;';
        
        actionButtons.innerHTML = `
            <button id="header-commit" style="padding: 4px 8px; font-size: 0.7rem; background: #0078d4; color: white; border: none; border-radius: 3px; cursor: pointer;">💾 Commit</button>
            <button id="header-clear" style="padding: 4px 8px; font-size: 0.7rem; background: #0078d4; color: white; border: none; border-radius: 3px; cursor: pointer;">🗑️ Clear</button>
            <button id="header-switch" style="padding: 4px 8px; font-size: 0.7rem; background: white; color: #0078d4; border: 1px solid #0078d4; border-radius: 3px; cursor: pointer;">🔄 Switch</button>
        `;

        // Insert before settings button
        const settingsBtn = userActions.querySelector('.settings-button');
        if (settingsBtn) {
            userActions.insertBefore(projectInfo, settingsBtn);
            userActions.insertBefore(actionButtons, settingsBtn);
        }

        // Wire up buttons
        document.getElementById('header-commit')?.addEventListener('click', () => this.commitToMemory());
        document.getElementById('header-clear')?.addEventListener('click', () => this.clearChatHistory());
        document.getElementById('header-switch')?.addEventListener('click', () => this.switchProject());

        console.log('✅ Header controls added');
    }

    removeHeaderControls() {
        document.getElementById('header-project-info')?.remove();
        document.getElementById('header-action-buttons')?.remove();
    }

    // Override render to remove blue bar
    render() {
        const originalRender = super.render();
        
        // Remove the chat header with blue bar
        return originalRender.replace(
            /<!-- Chat Header with Project Info -->[\s\S]*?<\/div>/,
            ''
        );
    }
}

export default ChatModuleV131;
window.ChatModuleV131 = ChatModuleV131;