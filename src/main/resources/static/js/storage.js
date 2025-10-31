class CompressionHistory {
    constructor() {
        this.dbName = 'CompressionToolDB';
        this.storeName = 'compressionHistory';
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    objectStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    async addRecord(record) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            
            const entry = {
                ...record,
                timestamp: new Date().toISOString()
            };

            const request = objectStore.add(entry);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getHistory(limit = 10) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const index = objectStore.index('timestamp');
            
            const request = index.openCursor(null, 'prev');
            const results = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && count < limit) {
                    results.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    async clearHistory() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getStats() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const records = request.result;
                const stats = {
                    totalCompressions: records.filter(r => r.action === 'compress').length,
                    totalDecompressions: records.filter(r => r.action === 'decompress').length,
                    totalSpaceSaved: records
                        .filter(r => r.action === 'compress')
                        .reduce((sum, r) => sum + (r.originalSize - r.compressedSize), 0),
                    averageCompressionRatio: 0
                };

                const compressionRecords = records.filter(r => r.action === 'compress' && r.compressionRatio);
                if (compressionRecords.length > 0) {
                    stats.averageCompressionRatio = 
                        compressionRecords.reduce((sum, r) => sum + r.compressionRatio, 0) / 
                        compressionRecords.length;
                }

                resolve(stats);
            };

            request.onerror = () => reject(request.error);
        });
    }
}

const historyManager = new CompressionHistory();
historyManager.init().catch(console.error);