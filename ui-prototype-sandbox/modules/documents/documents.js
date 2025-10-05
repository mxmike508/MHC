/**
 * DOCUMENTS MODULE - Bob AI Platform
 * 
 * Document management interface for construction projects
 * File upload, organization, and AI-powered analysis
 */

class DocumentsModule {
    constructor(sharedState, moduleLoader) {
        this.sharedState = sharedState;
        this.moduleLoader = moduleLoader;
        this.id = 'documents';
        this.documents = [];
    }

    async init(subModule = null) {
        console.log('Documents module initialized');
        this.subModule = subModule;
        this.loadMockDocuments();
    }

    loadMockDocuments() {
        this.documents = [
            {
                id: 'doc-001',
                name: 'Construction Contract - Semeniuk Project.pdf',
                type: 'contract',
                size: '2.4 MB',
                date: '2025-08-15',
                project: 'Semeniuk - Newport Beach Remodel',
                status: 'approved'
            },
            {
                id: 'doc-002',
                name: 'Electrical Plans - Updated.dwg',
                type: 'plans',
                size: '15.7 MB',
                date: '2025-08-18',
                project: 'Semeniuk - Newport Beach Remodel',
                status: 'review'
            },
            {
                id: 'doc-003',
                name: 'Progress Photos - Week 8.zip',
                type: 'photos',
                size: '48.2 MB',
                date: '2025-08-20',
                project: 'Johnson - Kitchen Renovation',
                status: 'approved'
            }
        ];
    }

    render() {
        return `
            <div class="documents-container">
                <!-- Documents Header -->
                <div class="documents-header">
                    <div class="header-title">
                        <h1>📁 Document Management</h1>
                        <p>Organize, analyze, and manage all project documents</p>
                    </div>
                    <div class="header-actions">
                        <button class="upload-btn primary">
                            <span class="btn-icon">📤</span>
                            Upload Documents
                        </button>
                        <button class="organize-btn">
                            <span class="btn-icon">📋</span>
                            Organize
                        </button>
                    </div>
                </div>

                <!-- Document Categories -->
                <div class="document-categories">
                    <button class="category-btn active" data-category="all">
                        <span class="category-icon">📄</span>
                        <span class="category-label">All Documents</span>
                        <span class="category-count">${this.documents.length}</span>
                    </button>
                    <button class="category-btn" data-category="contract">
                        <span class="category-icon">📋</span>
                        <span class="category-label">Contracts</span>
                        <span class="category-count">${this.documents.filter(d => d.type === 'contract').length}</span>
                    </button>
                    <button class="category-btn" data-category="plans">
                        <span class="category-icon">📐</span>
                        <span class="category-label">Plans & Specs</span>
                        <span class="category-count">${this.documents.filter(d => d.type === 'plans').length}</span>
                    </button>
                    <button class="category-btn" data-category="photos">
                        <span class="category-icon">📷</span>
                        <span class="category-label">Photos</span>
                        <span class="category-count">${this.documents.filter(d => d.type === 'photos').length}</span>
                    </button>
                    <button class="category-btn" data-category="reports">
                        <span class="category-icon">📊</span>
                        <span class="category-label">Reports</span>
                        <span class="category-count">0</span>
                    </button>
                </div>

                <!-- Document Actions Bar -->
                <div class="document-actions">
                    <div class="actions-left">
                        <div class="search-container">
                            <input type="text" placeholder="Search documents..." class="search-input">
                            <button class="search-btn">🔍</button>
                        </div>
                        <select class="project-filter">
                            <option value="">All Projects</option>
                            <option value="semeniuk">Semeniuk - Newport Beach</option>
                            <option value="johnson">Johnson - Kitchen</option>
                        </select>
                    </div>
                    <div class="actions-right">
                        <button class="view-btn active" data-view="grid">⊞</button>
                        <button class="view-btn" data-view="list">☰</button>
                        <button class="sort-btn">Sort ↕</button>
                    </div>
                </div>

                <!-- Document Grid -->
                <div class="documents-grid" id="documentsGrid">
                    ${this.renderDocuments()}
                </div>

                <!-- AI Document Analysis Panel -->
                <div class="ai-analysis-panel">
                    <div class="panel-header">
                        <h3>🤖 AI Document Analysis</h3>
                        <button class="panel-toggle">−</button>
                    </div>
                    <div class="panel-content">
                        <div class="analysis-suggestions">
                            <div class="suggestion-item">
                                <span class="suggestion-icon">⚠️</span>
                                <div class="suggestion-content">
                                    <h4>Contract Review Needed</h4>
                                    <p>2 documents require legal review before approval</p>
                                </div>
                                <button class="suggestion-action">Review</button>
                            </div>
                            <div class="suggestion-item">
                                <span class="suggestion-icon">📊</span>
                                <div class="suggestion-content">
                                    <h4>Progress Report Available</h4>
                                    <p>Generate updated project status from recent documents</p>
                                </div>
                                <button class="suggestion-action">Generate</button>
                            </div>
                            <div class="suggestion-item">
                                <span class="suggestion-icon">🔍</span>
                                <div class="suggestion-content">
                                    <h4>Document Analysis</h4>
                                    <p>AI can extract key information from uploaded documents</p>
                                </div>
                                <button class="suggestion-action" onclick="ModuleLoader.loadModule('chat')">Chat</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Upload Modal -->
            <div id="uploadModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Upload Documents</h2>
                        <button class="modal-close" onclick="this.closeUploadModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-area" id="uploadArea">
                            <div class="upload-icon">📤</div>
                            <h3>Drag & Drop Files Here</h3>
                            <p>or click to browse files</p>
                            <input type="file" id="fileInput" multiple style="display: none;">
                            <button class="browse-btn" onclick="document.getElementById('fileInput').click()">
                                Browse Files
                            </button>
                        </div>
                        <div class="upload-options">
                            <div class="form-group">
                                <label>Project:</label>
                                <select id="uploadProject">
                                    <option value="">Select Project</option>
                                    <option value="semeniuk">Semeniuk - Newport Beach</option>
                                    <option value="johnson">Johnson - Kitchen</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Document Type:</label>
                                <select id="uploadType">
                                    <option value="">Select Type</option>
                                    <option value="contract">Contract</option>
                                    <option value="plans">Plans & Specifications</option>
                                    <option value="photos">Photos</option>
                                    <option value="reports">Reports</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="aiAnalysis"> Enable AI Analysis
                                </label>
                                <small>Automatically extract key information and insights</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closeUploadModal()">Cancel</button>
                        <button class="btn-primary" onclick="this.uploadFiles()">Upload</button>
                    </div>
                </div>
            </div>

            <style>
                .documents-container {
                    padding: 1.5rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .documents-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #0078d4, #106ebe);
                    color: white;
                    border-radius: 8px;
                }

                .header-title h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .header-title p {
                    margin: 0.5rem 0 0 0;
                    opacity: 0.9;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                }

                .upload-btn, .organize-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border: 1px solid rgba(255,255,255,0.3);
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .upload-btn.primary {
                    background: white;
                    color: #0078d4;
                    border-color: white;
                }

                .upload-btn:hover, .organize-btn:hover {
                    background: rgba(255,255,255,0.2);
                }

                .upload-btn.primary:hover {
                    background: #f5f5f5;
                }

                .document-categories {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }

                .category-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .category-btn:hover {
                    border-color: #0078d4;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                .category-btn.active {
                    background: #0078d4;
                    color: white;
                    border-color: #0078d4;
                }

                .category-icon {
                    font-size: 1.2rem;
                }

                .category-count {
                    background: rgba(139, 58, 58, 0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    min-width: 20px;
                    text-align: center;
                }

                .category-btn.active .category-count {
                    background: rgba(255,255,255,0.2);
                    color: white;
                }

                .document-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                }

                .actions-left {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .search-container {
                    display: flex;
                    align-items: center;
                }

                .search-input {
                    padding: 0.5rem 1rem;
                    border: 1px solid #ccc;
                    border-radius: 4px 0 0 4px;
                    width: 250px;
                }

                .search-btn {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    border-left: none;
                    background: white;
                    border-radius: 0 4px 4px 0;
                    cursor: pointer;
                }

                .project-filter {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: white;
                }

                .actions-right {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .view-btn, .sort-btn {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .view-btn.active {
                    background: #0078d4;
                    color: white;
                    border-color: #0078d4;
                }

                .documents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .document-card {
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .document-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-color: #0078d4;
                }

                .document-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .document-icon {
                    font-size: 2rem;
                    opacity: 0.7;
                }

                .document-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .document-status.approved {
                    background: #e8f5e9;
                    color: #388e3c;
                }

                .document-status.review {
                    background: #fff3e0;
                    color: #f57c00;
                }

                .document-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                    word-break: break-word;
                }

                .document-details {
                    display: flex;
                    justify-content: space-between;
                    color: #666;
                    font-size: 0.85rem;
                    margin-bottom: 0.75rem;
                }

                .document-project {
                    color: #0078d4;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 1rem;
                }

                .document-actions-card {
                    display: flex;
                    gap: 0.5rem;
                }

                .doc-action-btn {
                    padding: 0.4rem 0.8rem;
                    border: 1px solid #e0e0e0;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: all 0.2s ease;
                }

                .doc-action-btn:hover {
                    border-color: #0078d4;
                    color: #0078d4;
                }

                .ai-analysis-panel {
                    background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: rgba(139, 58, 58, 0.05);
                    border-bottom: 1px solid #e0e0e0;
                }

                .panel-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 1.1rem;
                }

                .panel-toggle {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #666;
                }

                .panel-content {
                    padding: 1.5rem;
                }

                .analysis-suggestions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                }

                .suggestion-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .suggestion-content {
                    flex: 1;
                }

                .suggestion-content h4 {
                    margin: 0 0 0.25rem 0;
                    color: #333;
                    font-size: 0.95rem;
                }

                .suggestion-content p {
                    margin: 0;
                    color: #666;
                    font-size: 0.85rem;
                }

                .suggestion-action {
                    padding: 0.5rem 1rem;
                    background: #0078d4;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: background 0.2s ease;
                }

                .suggestion-action:hover {
                    background: #106ebe;
                }

                /* Upload Modal Styles */
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

                .upload-area {
                    border: 2px dashed #ccc;
                    border-radius: 8px;
                    padding: 3rem 2rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    transition: all 0.2s ease;
                }

                .upload-area:hover {
                    border-color: #0078d4;
                    background: #fafafa;
                }

                .upload-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    color: #666;
                }

                .upload-area h3 {
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .upload-area p {
                    color: #666;
                    margin-bottom: 1.5rem;
                }

                .browse-btn {
                    padding: 0.75rem 2rem;
                    background: #0078d4;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }

                .upload-options {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-weight: 500;
                    color: #333;
                }

                .form-group select {
                    padding: 0.75rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: white;
                }

                .form-group input[type="checkbox"] {
                    margin-right: 0.5rem;
                }

                .form-group small {
                    color: #666;
                    font-size: 0.85rem;
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

                .btn-secondary {
                    background: white;
                    color: #666;
                    border: 1px solid #ccc;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .documents-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }
                    
                    .header-actions {
                        justify-content: center;
                    }
                    
                    .document-categories {
                        overflow-x: auto;
                        padding-bottom: 1rem;
                    }
                    
                    .document-actions {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }
                    
                    .actions-left {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .search-input {
                        width: 100%;
                    }
                    
                    .documents-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .suggestion-item {
                        flex-direction: column;
                        text-align: center;
                        gap: 0.75rem;
                    }
                }
            </style>
        `;
    }

    renderDocuments() {
        return this.documents.map(doc => `
            <div class="document-card" data-doc-id="${doc.id}">
                <div class="document-header">
                    <span class="document-icon">${this.getDocumentIcon(doc.type)}</span>
                    <span class="document-status ${doc.status}">${doc.status}</span>
                </div>
                <div class="document-title">${doc.name}</div>
                <div class="document-details">
                    <span>${doc.size}</span>
                    <span>${doc.date}</span>
                </div>
                <div class="document-project">${doc.project}</div>
                <div class="document-actions-card">
                    <button class="doc-action-btn" onclick="this.viewDocument('${doc.id}')">View</button>
                    <button class="doc-action-btn" onclick="this.downloadDocument('${doc.id}')">Download</button>
                    <button class="doc-action-btn" onclick="this.analyzeDocument('${doc.id}')">AI Analyze</button>
                </div>
            </div>
        `).join('');
    }

    getDocumentIcon(type) {
        const icons = {
            contract: '📋',
            plans: '📐',
            photos: '📷',
            reports: '📊',
            other: '📄'
        };
        return icons[type] || icons.other;
    }

    async postRender() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Category filtering
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterDocuments(e.target.dataset.category);
            });
        });

        // Upload button
        document.querySelector('.upload-btn').addEventListener('click', () => {
            this.showUploadModal();
        });

        // Search functionality
        document.querySelector('.search-input').addEventListener('input', (e) => {
            this.searchDocuments(e.target.value);
        });
    }

    filterDocuments(category) {
        console.log(`Filtering documents by category: ${category}`);
        // Implementation for filtering documents
    }

    searchDocuments(query) {
        console.log(`Searching documents for: ${query}`);
        // Implementation for searching documents
    }

    showUploadModal() {
        document.getElementById('uploadModal').style.display = 'flex';
    }

    closeUploadModal() {
        document.getElementById('uploadModal').style.display = 'none';
    }

    uploadFiles() {
        console.log('Uploading files...');
        // Implementation for file upload
        this.closeUploadModal();
        alert('File upload functionality would be implemented here');
    }

    viewDocument(docId) {
        console.log(`Viewing document: ${docId}`);
        alert(`Document viewer would open for document ${docId}`);
    }

    downloadDocument(docId) {
        console.log(`Downloading document: ${docId}`);
        alert(`Document download would start for document ${docId}`);
    }

    analyzeDocument(docId) {
        console.log(`Analyzing document: ${docId}`);
        // Switch to chat module with document analysis context
        ModuleLoader.loadModule('chat');
        // In real implementation, would pass document context
    }

    onStateChange(updates) {
        if (updates.currentProject) {
            console.log('Documents module updated for project:', updates.currentProject);
        }
    }

    cleanup() {
        console.log('Documents module cleaned up');
    }
}

// Export the module
export default DocumentsModule;