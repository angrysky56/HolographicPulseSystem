import fs from 'fs';
import path from 'path';

class LMStudioConfig {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const configPath = path.join(process.cwd(), 'config', 'lm-studio.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('Error loading LM Studio config:', error);
            return this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            host: 'http://localhost',
            port: 1234,
            models: {
                embedding: 'all-MiniLM-L6-v2',
                completion: 'mistral-7b-instruct-v0.1'
            },
            settings: {
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.95
            },
            timeouts: {
                startup: 10000,
                request: 30000
            }
        };
    }

    getFullUrl() {
        return `${this.config.host}:${this.config.port}`;
    }

    getEmbeddingModel() {
        return this.config.models.embedding;
    }

    getCompletionModel() {
        return this.config.models.completion;
    }

    getSettings() {
        return this.config.settings;
    }

    getTimeouts() {
        return this.config.timeouts;
    }
}

export default new LMStudioConfig();