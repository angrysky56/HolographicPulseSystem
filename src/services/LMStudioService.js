import fetch from 'node-fetch';

export class LMStudioService {
    constructor(config = {}) {
        this.baseUrl = 'http://localhost:1234';  // Updated to match your setup
        this.embeddingModel = "text-embedding-nomic-embed-text-v1.5@q8_0";
        this.chatModel = "meta-llama-3.1-8b-instruct-abilitated";
    }

    async generateEmbeddings(text) {
        try {
            console.log('Generating embeddings for:', text.substring(0, 50) + '...');
            
            const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: text,
                    model: this.embeddingModel
                })
            });

            if (!response.ok) {
                throw new Error(`Embedding generation failed: ${await response.text()}`);
            }

            const data = await response.json();
            console.log('Successfully generated embeddings');
            return data.data[0].embedding;
        } catch (error) {
            console.error('Error generating embeddings:', error);
            // Return a default embedding if needed
            return new Array(384).fill(0);
        }
    }

    async generateResponse(prompt) {
        try {
            console.log('Generating response for:', prompt.substring(0, 50) + '...');
            
            const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: prompt
                    }],
                    model: this.chatModel,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Response generation failed: ${await response.text()}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating response:', error);
            return `Error generating response: ${error.message}`;
        }
    }
}