const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'history') {
        loadHistory();
    }
}

const compressFileInput = document.getElementById('compress-file');
const compressDropZone = document.getElementById('compress-drop-zone');
const compressFileNameSpan = document.getElementById('compress-file-name');
const filePreview = document.getElementById('file-preview');
const fileList = document.getElementById('file-list');

let selectedFiles = [];

compressDropZone.addEventListener('click', function(e) {
    if (e.target === compressDropZone || e.target.closest('.file-name')) {
        compressFileInput.click();
    }
});

compressFileInput.addEventListener('change', function(e) {
    handleFileSelection(Array.from(e.target.files));
});

compressDropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    compressFileNameSpan.classList.add('drag-over');
});

compressDropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    compressFileNameSpan.classList.remove('drag-over');
});

compressDropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    compressFileNameSpan.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
});

function handleFileSelection(files) {
    selectedFiles = files;
    
    if (files.length === 0) {
        filePreview.classList.add('hidden');
        compressFileNameSpan.classList.remove('has-file');
        return;
    }
    
    compressFileNameSpan.classList.add('has-file');
    filePreview.classList.remove('hidden');
    
    fileList.innerHTML = '';
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name-text">📄 ${file.name}</div>
                <div class="file-size">${formatBytes(file.size)} • ${file.type || 'Unknown type'}</div>
            </div>
            <button type="button" class="file-remove" data-index="${index}">Remove</button>
        `;
        fileList.appendChild(fileItem);
    });
    
    document.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFile(index);
        });
    });
    
    const summary = files.length === 1 
        ? `${files[0].name} (${formatBytes(files[0].size)})`
        : `${files.length} files selected`;
    
    document.querySelector('.drop-text').textContent = summary;
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    compressFileInput.files = dt.files;
    
    handleFileSelection(selectedFiles);
}

const decompressFileInput = document.getElementById('decompress-file');
const decompressDropZone = document.getElementById('decompress-drop-zone');
const decompressFileNameSpan = document.getElementById('decompress-file-name');
const decompressFilePreview = document.getElementById('decompress-file-preview');
const decompressFileInfo = document.getElementById('decompress-file-info');

decompressDropZone.addEventListener('click', function(e) {
    if (e.target === decompressDropZone || e.target.closest('.file-name')) {
        decompressFileInput.click();
    }
});

decompressFileInput.addEventListener('change', function(e) {
    if (e.target.files[0]) {
        const file = e.target.files[0];
        decompressFileNameSpan.classList.add('has-file');
        decompressFilePreview.classList.remove('hidden');
        
        document.querySelector('#decompress-file-name .drop-text').textContent = file.name;
        
        decompressFileInfo.innerHTML = `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name-text">📦 ${file.name}</div>
                    <div class="file-size">${formatBytes(file.size)}</div>
                </div>
            </div>
        `;
    }
});

decompressDropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    decompressFileNameSpan.classList.add('drag-over');
});

decompressDropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    decompressFileNameSpan.classList.remove('drag-over');
});

decompressDropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    decompressFileNameSpan.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        decompressFileInput.files = files;
        const event = new Event('change', { bubbles: true });
        decompressFileInput.dispatchEvent(event);
    }
});

document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const passwordGroup = document.getElementById('password-group');
        if (this.value === 'zip') {
            passwordGroup.style.display = 'block';
        } else {
            passwordGroup.style.display = 'none';
            document.getElementById('password').value = '';
        }
    });
});

document.getElementById('compress-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('compress-file');
    const resultDiv = document.getElementById('compress-result');
    const statsDiv = document.getElementById('compress-stats');
    const progressContainer = document.getElementById('compress-progress');
    const progressFill = document.getElementById('compress-progress-fill');
    const progressText = document.getElementById('compress-progress-text');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showResult(resultDiv, 'Please select at least one file', 'error');
        return;
    }
    
    let totalSize = 0;
    for (let file of fileInput.files) {
        totalSize += file.size;
    }
    
    if (totalSize > 50 * 1024 * 1024) {
        showResult(resultDiv, 'Total file size exceeds 50MB limit', 'error');
        return;
    }
    
    const formData = new FormData();
    for (let file of fileInput.files) {
        formData.append('file', file);
    }
    formData.append('type', document.querySelector('input[name="type"]:checked').value);
    formData.append('level', document.getElementById('compression-level').value);
    
    const password = document.getElementById('password').value;
    if (password) {
        formData.append('password', password);
    }
    
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    statsDiv.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Compressing... ${Math.round(progress)}%`;
    }, 200);
    
    try {
        const response = await fetch('/compress', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete! 100%';
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
        const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0');
        const compressionRatio = parseFloat(response.headers.get('X-Compression-Ratio') || '0');
        const fileCount = parseInt(response.headers.get('X-File-Count') || '1');
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        const outputFileName = fileNameMatch ? fileNameMatch[1].replace(/['"]/g, '') : 'compressed_file';
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        const fileText = fileCount > 1 ? `${fileCount} files` : 'File';
        showResult(resultDiv, `${fileText} compressed successfully! Download started.`, 'success');
        showStats(statsDiv, originalSize, compressedSize, compressionRatio, fileCount);
        
        await historyManager.addRecord({
            action: 'compress',
            fileName: outputFileName,
            originalSize: originalSize,
            compressedSize: compressedSize,
            compressionRatio: compressionRatio,
            compressionType: document.querySelector('input[name="type"]:checked').value,
            fileCount: fileCount
        });
        
        setTimeout(() => {
            progressContainer.classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        clearInterval(progressInterval);
        progressContainer.classList.add('hidden');
        console.error('Compression error:', error);
        showResult(resultDiv, `Compression failed: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});

document.getElementById('decompress-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('decompress-file');
    const resultDiv = document.getElementById('decompress-result');
    const progressContainer = document.getElementById('decompress-progress');
    const progressFill = document.getElementById('decompress-progress-fill');
    const progressText = document.getElementById('decompress-progress-text');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    if (!fileInput.files[0]) {
        showResult(resultDiv, 'Please select a file', 'error');
        return;
    }
    
    const fileName = fileInput.files[0].name.toLowerCase();
    if (!fileName.endsWith('.gz') && !fileName.endsWith('.zip') && !fileName.endsWith('.deflate') && 
        !fileName.endsWith('.tar.gz') && !fileName.endsWith('.tgz') && !fileName.endsWith('.rar')) {
        showResult(resultDiv, 'Please select a valid compressed file', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    const password = document.getElementById('decompress-password').value;
    if (password) {
        formData.append('password', password);
    }
    
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Decompressing... ${Math.round(progress)}%`;
    }, 200);
    
    try {
        const response = await fetch('/decompress', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Complete! 100%';
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        const outputFileName = fileNameMatch ? fileNameMatch[1].replace(/['"]/g, '') : 'decompressed_file';
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showResult(resultDiv, `File decompressed successfully! Download started.`, 'success');
        
        await historyManager.addRecord({
            action: 'decompress',
            fileName: outputFileName,
            originalSize: blob.size,
            compressedSize: fileInput.files[0].size,
            compressionType: fileName.split('.').pop()
        });
        
        setTimeout(() => {
            progressContainer.classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        clearInterval(progressInterval);
        progressContainer.classList.add('hidden');
        console.error('Decompression error:', error);
        showResult(resultDiv, `Decompression failed: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});

async function loadHistory() {
    try {
        const history = await historyManager.getHistory(20);
        const stats = await historyManager.getStats();
        
        document.getElementById('total-compressions').textContent = stats.totalCompressions;
        document.getElementById('total-decompressions').textContent = stats.totalDecompressions;
        document.getElementById('total-space-saved').textContent = formatBytes(stats.totalSpaceSaved);
        document.getElementById('avg-compression-ratio').textContent = stats.averageCompressionRatio.toFixed(2) + '%';
        
        const historyList = document.getElementById('history-list');
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>No compression history yet</p>
                    <p class="empty-subtext">Start compressing files to see your history here</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = history.map(item => `
            <div class="history-item ${item.action}">
                <div class="history-header-row">
                    <span class="history-action ${item.action}">
                        ${item.action === 'compress' ? '📦 Compressed' : '📂 Decompressed'}
                    </span>
                    <span class="history-time">${formatDateTime(item.timestamp)}</span>
                </div>
                <div class="history-details">
                    <div class="history-detail">
                        <strong>File:</strong>
                        <span>${item.fileName}</span>
                    </div>
                    ${item.action === 'compress' ? `
                        <div class="history-detail">
                            <strong>Original:</strong>
                            <span>${formatBytes(item.originalSize)}</span>
                        </div>
                        <div class="history-detail">
                            <strong>Compressed:</strong>
                            <span>${formatBytes(item.compressedSize)}</span>
                        </div>
                        <div class="history-detail">
                            <strong>Saved:</strong>
                            <span>${item.compressionRatio.toFixed(2)}%</span>
                        </div>
                        ${item.fileCount > 1 ? `
                            <div class="history-detail">
                                <strong>Files:</strong>
                                <span>${item.fileCount}</span>
                            </div>
                        ` : ''}
                    ` : `
                        <div class="history-detail">
                            <strong>Size:</strong>
                            <span>${formatBytes(item.originalSize)}</span>
                        </div>
                    `}
                    <div class="history-detail">
                        <strong>Type:</strong>
                        <span>${item.compressionType.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

document.getElementById('clear-history-btn').addEventListener('click', async function() {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        await historyManager.clearHistory();
        await loadHistory();
    }
});

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showResult(element, message, type) {
    element.textContent = message;
    element.className = `result ${type}`;
    element.classList.remove('hidden');
}

function showStats(element, originalSize, compressedSize, compressionRatio, fileCount = 1) {
    element.innerHTML = `
        <h3>Compression Statistics</h3>
        <div class="stat-item">
            <span class="stat-label">Original Size:</span>
            <span class="stat-value">${formatBytes(originalSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Compressed Size:</span>
            <span class="stat-value">${formatBytes(compressedSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Space Saved:</span>
            <span class="stat-value">${compressionRatio.toFixed(2)}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Compression Ratio:</span>
            <span class="stat-value">${(originalSize / compressedSize).toFixed(2)}:1</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Files Compressed:</span>
            <span class="stat-value">${fileCount}</span>
        </div>
    `;
    element.classList.remove('hidden');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}