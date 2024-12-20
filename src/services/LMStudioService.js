export class LMStudioService {
    constructor() {
        this.baseUrl = process.env.LM_STUDIO_URL || 'http://192.168.1.82:1234/v1';
        this.embeddingModel = 'text-embedding-nomic-embed-text-v1.5@Q8_0';
    }

    async generateEmbeddings(text) {
        const response = await fetch(`${this.baseUrl}/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: text,
                model: this.embeddingModel
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate embeddings: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data[0].embedding;
    }

    async analyzeContext(text, context) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: `You are an AI analysis agent. Context: ${context}`
                    },
                    {
                        role: "user",
                        content: `Analyze this: ${text}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to analyze context: ${response.statusText}`);
        }

        const result = await response.json();
        return {
            analysis: result.choices[0].message.content,
            confidence: 0.9,
            timestamp: new Date()
        };
    }

    async generateResponse(prompt, params = {}) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: params.temperature || 0.7,
                max_tokens: params.max_tokens || 500
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate response: ${response.statusText}`);
        }

        const result = await response.json();
        return result.choices[0].message.content;
    }
}