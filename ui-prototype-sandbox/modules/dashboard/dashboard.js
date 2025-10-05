/**
 * DASHBOARD MODULE - Bob AI Platform
 * 
 * Main landing page module inspired by BuilderTrend's professional dashboard
 * Provides project overview, quick actions, and key performance metrics
 */

class DashboardModule {
    constructor(sharedState, moduleLoader) {
        this.sharedState = sharedState;
        this.moduleLoader = moduleLoader;
        this.id = 'dashboard';
        this.refreshInterval = null;
    }

    async init(subModule = null) {
        console.log('Dashboard module initialized');
        this.subModule = subModule;
        
        // Set up periodic refresh
        this.refreshInterval = setInterval(() => {
            this.updateLiveData();
        }, 30000); // Refresh every 30 seconds
    }

    render() {
        return `
            <div class="dashboard-container">
                <!-- Dashboard Header -->
                <div class="dashboard-header">
                    <div class="project-info">
                        <h1 class="project-title">Mike Holland Construction - Dashboard</h1>
                        <p class="project-location">Newport Beach, CA 92660</p>
                        <div class="project-status">
                            <span class="status-indicator online"></span>
                            <span class="status-text">3 internal users are clocked in as of 3:34 PM</span>
                        </div>
                    </div>
                    <div class="dashboard-actions">
                        <button class="action-button" onclick="this.viewTimeSheets()">View time sheets</button>
                        <button class="action-button primary" onclick="this.createNewProject()">Create New Project</button>
                    </div>
                </div>

                <!-- Quick Stats Overview -->
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-header">
                            <h3>Active Projects</h3>
                            <span class="stat-icon">🏗️</span>
                        </div>
                        <div class="stat-value">12</div>
                        <div class="stat-change positive">+2 this month</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Client Interactions</h3>
                        <div class="stat-value">847</div>
                        <div class="stat-change positive">+15% this week</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Revenue (MTD)</h3>
                        <div class="stat-value">$284,500</div>
                        <div class="stat-change positive">+8.2%</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Completion Rate</h3>
                        <div class="stat-value">94.5%</div>
                        <div class="stat-change neutral">On target</div>
                    </div>
                </div>

                <!-- Main Dashboard Content -->
                <div class="dashboard-content">
                    <!-- Left Column -->
                    <div class="content-left">
                        <!-- Active Projects Section -->
                        <section class="dashboard-section">
                            <div class="section-header">
                                <h2>Active Projects</h2>
                                <div class="section-controls">
                                    <button class="view-all-btn">View All</button>
                                    <div class="filter-buttons">
                                        <button class="filter-btn active">All</button>
                                        <button class="filter-btn">In Progress</button>
                                        <button class="filter-btn">Review</button>
                                    </div>
                                </div>
                            </div>
                            <div class="projects-grid">
                                <div class="project-card">
                                    <div class="project-header">
                                        <h3>Semeniuk - Newport Beach Remodel</h3>
                                        <span class="project-phase">Precale</span>
                                    </div>
                                    <div class="project-details">
                                        <p>67 Cape Andover, Newport Beach, CA 92660</p>
                                        <div class="project-progress">
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: 75%"></div>
                                            </div>
                                            <span class="progress-text">75% Complete</span>
                                        </div>
                                    </div>
                                    <div class="project-team">
                                        <div class="team-section">
                                            <h4>Clients</h4>
                                            <div class="team-member">
                                                <span class="member-avatar">CS</span>
                                                <span class="add-member">+</span>
                                            </div>
                                        </div>
                                        <div class="team-section">
                                            <h4>Project Managers</h4>
                                            <div class="team-member">
                                                <span class="member-avatar">CC</span>
                                                <span class="add-member">+</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="project-card">
                                    <div class="project-header">
                                        <h3>Johnson - Kitchen Renovation</h3>
                                        <span class="project-phase">Active</span>
                                    </div>
                                    <div class="project-details">
                                        <p>123 Main Street, Irvine, CA 92602</p>
                                        <div class="project-progress">
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: 45%"></div>
                                            </div>
                                            <span class="progress-text">45% Complete</span>
                                        </div>
                                    </div>
                                    <div class="project-team">
                                        <div class="team-section">
                                            <h4>Clients</h4>
                                            <div class="team-member">
                                                <span class="member-avatar">JJ</span>
                                                <span class="add-member">+</span>
                                            </div>
                                        </div>
                                        <div class="team-section">
                                            <h4>Project Managers</h4>
                                            <div class="team-member">
                                                <span class="member-avatar">MH</span>
                                                <span class="add-member">+</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Task Status Section -->
                        <section class="dashboard-section">
                            <div class="section-header">
                                <h2>Task Status Overview</h2>
                            </div>
                            <div class="task-overview">
                                <div class="task-status-grid">
                                    <div class="task-status-item">
                                        <div class="task-icon past-due">📋</div>
                                        <div class="task-content">
                                            <h3>PAST DUE</h3>
                                            <p class="task-description">Everything is up-to-date.</p>
                                        </div>
                                    </div>
                                    <div class="task-status-item">
                                        <div class="task-icon due-today">📋</div>
                                        <div class="task-content">
                                            <h3>DUE TODAY</h3>
                                            <p class="task-description">You have nothing due today.</p>
                                        </div>
                                    </div>
                                    <div class="task-status-item">
                                        <div class="task-content action-items">
                                            <h3>ACTION ITEMS FOR YOU</h3>
                                            <div class="action-list">
                                                <div class="action-item">
                                                    <span class="action-count">3</span>
                                                    <span class="action-label">Unapproved Shifts</span>
                                                </div>
                                                <div class="action-item">
                                                    <span class="action-count">17</span>
                                                    <span class="action-label">Unapproved Bid Packages</span>
                                                </div>
                                                <div class="action-item">
                                                    <span class="action-count">1</span>
                                                    <span class="action-label">Unapproved Estimates</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Recent Activity Section -->
                        <section class="dashboard-section">
                            <div class="section-header">
                                <h2>Recent Activity From Your Team</h2>
                                <div class="activity-filter">
                                    <button class="filter-button active">🔽 Filter</button>
                                </div>
                            </div>
                            <div class="activity-feed">
                                <div class="activity-date-group">
                                    <h3 class="activity-date">Aug 18, 2025</h3>
                                    <div class="activity-item">
                                        <div class="activity-avatar">
                                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%238b3a3a'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='white' font-family='Arial' font-size='14'%3ES%3C/text%3E%3C/svg%3E" alt="User" class="avatar-img">
                                        </div>
                                        <div class="activity-content">
                                            <h4>Semeniuk - Newport Beach Remodel</h4>
                                            <p class="activity-time">Aug 18, 2025, 8:38 PM</p>
                                            <p class="activity-description">Elements of Style Fine Cabinetry resubmitted a Bid</p>
                                            <p class="activity-details">Cabinets, All Cabinets</p>
                                            <div class="activity-notes">
                                                <p>Please review Revised Estimate. Based on Designer Drawings.</p>
                                                <p>Minor Discrepancies in Designer Drawings that may need to be clarified.</p>
                                                <p>Please read Notes on Estimate about omitted Materials and Areas.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- AI Chat Integration -->
                        <section class="dashboard-section ai-chat-section">
                            <div class="section-header">
                                <h2>AI Assistant Quick Access</h2>
                            </div>
                            <div class="ai-chat-preview">
                                <div class="chat-suggestion">
                                    <p>"This would be a great area to chat with the UI"</p>
                                    <button class="chat-button" onclick="ModuleLoader.loadModule('chat')">Start AI Chat</button>
                                </div>
                                <div class="ai-features">
                                    <div class="ai-feature">
                                        <span class="feature-icon">📄</span>
                                        <span>Document Analysis</span>
                                    </div>
                                    <div class="ai-feature">
                                        <span class="feature-icon">💡</span>
                                        <span>Project Insights</span>
                                    </div>
                                    <div class="ai-feature">
                                        <span class="feature-icon">🔄</span>
                                        <span>Workflow Automation</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Right Column - Quick Actions -->
                    <div class="content-right">
                        <div class="quick-actions-panel">
                            <h3>Quick Actions</h3>
                            <div class="quick-action-grid">
                                <button class="quick-action-btn" onclick="this.createProject()">
                                    <span class="action-icon">➕</span>
                                    <span>New Project</span>
                                </button>
                                <button class="quick-action-btn" onclick="ModuleLoader.loadModule('chat')">
                                    <span class="action-icon">💬</span>
                                    <span>AI Assistant</span>
                                </button>
                                <button class="quick-action-btn" onclick="ModuleLoader.loadModule('documents')">
                                    <span class="action-icon">📁</span>
                                    <span>Files</span>
                                </button>
                                <button class="quick-action-btn" onclick="this.generateReport()">
                                    <span class="action-icon">📊</span>
                                    <span>Reports</span>
                                </button>
                                <button class="quick-action-btn" onclick="this.scheduleWork()">
                                    <span class="action-icon">📅</span>
                                    <span>Schedule</span>
                                </button>
                                <button class="quick-action-btn" onclick="this.viewFinancials()">
                                    <span class="action-icon">💰</span>
                                    <span>Financials</span>
                                </button>
                            </div>
                        </div>

                        <!-- Performance Metrics -->
                        <div class="metrics-panel">
                            <h3>Performance Metrics</h3>
                            <div class="metric-item">
                                <span class="metric-label">Project Completion Rate</span>
                                <div class="metric-bar">
                                    <div class="metric-fill" style="width: 94%"></div>
                                </div>
                                <span class="metric-value">94%</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Client Satisfaction</span>
                                <div class="metric-bar">
                                    <div class="metric-fill" style="width: 98%"></div>
                                </div>
                                <span class="metric-value">98%</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Budget Accuracy</span>
                                <div class="metric-bar">
                                    <div class="metric-fill" style="width: 87%"></div>
                                </div>
                                <span class="metric-value">87%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .dashboard-container {
                    padding: 1.5rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #0078d4, #106ebe);
                    color: white;
                    border-radius: 8px;
                }

                .project-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .project-location {
                    opacity: 0.9;
                    margin-bottom: 0.75rem;
                }

                .project-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #4caf50;
                }

                .dashboard-actions {
                    display: flex;
                    gap: 1rem;
                }

                .action-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid rgba(255,255,255,0.3);
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-button:hover {
                    background: rgba(255,255,255,0.2);
                }

                .action-button.primary {
                    background: white;
                    color: #0078d4;
                    border-color: white;
                }

                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    border-left: 4px solid #0078d4;
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .stat-header h3 {
                    font-size: 0.9rem;
                    color: #666;
                    font-weight: 500;
                }

                .stat-icon {
                    font-size: 1.2rem;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 0.5rem;
                }

                .stat-change {
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .stat-change.positive {
                    color: #4caf50;
                }

                .stat-change.negative {
                    color: #f44336;
                }

                .stat-change.neutral {
                    color: #666;
                }

                .dashboard-content {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 2rem;
                }

                .dashboard-section {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 1.5rem;
                    overflow: hidden;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e0e0e0;
                    background: #f8f9fa;
                }

                .section-header h2 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #333;
                }

                .projects-grid {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .project-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    padding: 1.5rem;
                    transition: box-shadow 0.2s ease;
                }

                .project-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .project-header h3 {
                    color: #333;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .project-phase {
                    background: #0078d4;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .project-progress {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin: 1rem 0;
                }

                .progress-bar {
                    flex: 1;
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: #4caf50;
                    transition: width 0.3s ease;
                }

                .progress-text {
                    font-size: 0.85rem;
                    color: #666;
                    min-width: 80px;
                }

                .project-team {
                    display: flex;
                    gap: 2rem;
                    margin-top: 1rem;
                }

                .team-section h4 {
                    font-size: 0.85rem;
                    color: #666;
                    margin-bottom: 0.5rem;
                }

                .team-member {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .member-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #0078d4;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .add-member {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px dashed #ccc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #666;
                    font-size: 1rem;
                }

                .task-overview {
                    padding: 1.5rem;
                }

                .task-status-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .task-status-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                }

                .task-icon {
                    font-size: 2rem;
                    opacity: 0.7;
                }

                .action-items {
                    grid-column: span 2;
                    flex-direction: column;
                    align-items: stretch;
                }

                .action-list {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 1rem;
                }

                .action-item {
                    text-align: center;
                }

                .action-count {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0078d4;
                    margin-bottom: 0.25rem;
                }

                .action-label {
                    font-size: 0.8rem;
                    color: #666;
                }

                .activity-feed {
                    padding: 1.5rem;
                }

                .activity-date {
                    color: #0078d4;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .activity-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    margin-bottom: 1rem;
                }

                .activity-avatar {
                    flex-shrink: 0;
                }

                .avatar-img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                }

                .activity-content h4 {
                    color: #333;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .activity-time {
                    color: #666;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .activity-description {
                    color: #333;
                    margin-bottom: 0.25rem;
                }

                .activity-details {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }

                .activity-notes p {
                    color: #666;
                    font-size: 0.85rem;
                    margin-bottom: 0.25rem;
                }

                .ai-chat-section {
                    background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
                }

                .ai-chat-preview {
                    padding: 1.5rem;
                    text-align: center;
                }

                .chat-suggestion p {
                    font-style: italic;
                    color: #666;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                }

                .chat-button {
                    background: #0078d4;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s ease;
                    margin-bottom: 1.5rem;
                }

                .chat-button:hover {
                    background: #106ebe;
                }

                .ai-features {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                }

                .ai-feature {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #666;
                    font-size: 0.9rem;
                }

                .content-right {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .quick-actions-panel,
                .metrics-panel {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    padding: 1.5rem;
                }

                .quick-actions-panel h3,
                .metrics-panel h3 {
                    margin-bottom: 1rem;
                    color: #333;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .quick-action-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                .quick-action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 0.5rem;
                    border: 1px solid #e0e0e0;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.85rem;
                }

                .quick-action-btn:hover {
                    background: #f8f9fa;
                    border-color: #0078d4;
                }

                .action-icon {
                    font-size: 1.5rem;
                }

                .metric-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .metric-label {
                    font-size: 0.85rem;
                    color: #666;
                    min-width: 120px;
                }

                .metric-bar {
                    flex: 1;
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .metric-fill {
                    height: 100%;
                    background: #4caf50;
                }

                .metric-value {
                    font-weight: 600;
                    color: #333;
                    min-width: 40px;
                    text-align: right;
                }

                @media (max-width: 768px) {
                    .dashboard-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .content-right {
                        order: -1;
                    }
                    
                    .stats-overview {
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    }
                    
                    .dashboard-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }
                    
                    .dashboard-actions {
                        justify-content: center;
                    }
                }
            </style>
        `;
    }

    async postRender() {
        // Set up event listeners and interactive functionality
        this.setupEventListeners();
        this.updateLiveData();
    }

    setupEventListeners() {
        // Add event listeners for dashboard interactions
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterProjects(e.target.textContent);
            });
        });
    }

    filterProjects(filter) {
        console.log(`Filtering projects by: ${filter}`);
        // Implementation for project filtering
    }

    updateLiveData() {
        // Update live data elements
        const timeElement = document.querySelector('.status-text');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            timeElement.textContent = `3 internal users are clocked in as of ${timeString}`;
        }
    }

    createProject() {
        alert('Create New Project functionality would be implemented here');
        // This would typically load the project creation module
    }

    generateReport() {
        ModuleLoader.loadModule('reports');
    }

    scheduleWork() {
        alert('Schedule Work functionality would integrate with calendar system');
    }

    viewFinancials() {
        ModuleLoader.loadModule('financial');
    }

    viewTimeSheets() {
        alert('Time sheets functionality would be implemented here');
    }

    createNewProject() {
        alert('New project creation dialog would appear here');
    }

    refresh() {
        this.updateLiveData();
        console.log('Dashboard refreshed');
    }

    onStateChange(updates) {
        if (updates.currentProject) {
            // Update project-specific dashboard data
            this.updateProjectInfo(updates.currentProject);
        }
    }

    updateProjectInfo(project) {
        // Update dashboard with current project information
        console.log('Updating dashboard for project:', project);
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        console.log('Dashboard module cleaned up');
    }
}

// Export the module
export default DashboardModule;