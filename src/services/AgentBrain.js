import { LMStudioService } from './LMStudioService.js';
import { EssanCore } from './EssanCore.js';

export class AgentBrain {
    constructor(agentConfig) {
        this.lmStudio = new LMStudioService();
        this.essan = new EssanCore();
        this.config = agentConfig;
        this.memory = [];
    }

    async processMessage(message) {
        // Generate context from agent's role and capabilities
        const context = `
            You are ${this.config.id}, a ${this.config.role}.
            Your capabilities are: ${this.config.capabilities.join(', ')}.
            Previous context: ${JSON.stringify(this.memory.slice(-3))}
        `;

        // Analyze message using LM Studio
        const analysis = await this.lmStudio.analyzeContext(
            message.pattern.content,
            context
        );

        // Generate appropriate response based on message type
        let response;
        switch (message.pattern.type) {
            case 'INTERROGATIVE':
                response = await this.handleQuestion(message, analysis);
                break;
            case 'IMPERATIVE':
                response = await this.handleCommand(message, analysis);
                break;
            case 'DECLARATIVE':
                response = await this.handleDeclaration(message, analysis);
                break;
            default:
                response = {
                    type: 'DECLARATIVE',
                    content: 'Message type not recognized'
                };
        }

        // Store interaction in memory
        this.memory.push({
            timestamp: new Date(),
            received: message.pattern.content,
            analysis,
            response
        });

        // Trim memory if too long
        if (this.memory.length > 10) {
            this.memory = this.memory.slice(-10);
        }

        return response;
    }

    async handleQuestion(message, analysis) {
        const prompt = `
        As ${this.config.id} (${this.config.role}), answer this question:
        Question: ${message.pattern.content}
        Analysis: ${analysis}
        Your capabilities: ${this.config.capabilities.join(', ')}

        Provide a response that:
        1. Utilizes your specific capabilities
        2. References relevant past interactions
        3. Maintains consistency with your role

        Response:
        `;

        const response = await this.lmStudio.generateResponse(prompt, {
            temperature: 0.7,
            max_tokens: 200
        });

        return {
            type: 'DECLARATIVE',
            content: response
        };
    }

    async handleCommand(message, analysis) {
        // Check if command aligns with capabilities
        const canExecute = this.config.capabilities.some(cap =>
            message.pattern.content.toLowerCase().includes(cap.toLowerCase())
        );

        if (!canExecute) {
            return {
                type: 'DECLARATIVE',
                content: `Cannot execute command: Missing required capability. My capabilities are: ${this.config.capabilities.join(', ')}`
            };
        }

        const prompt = `
        As ${this.config.id} (${this.config.role}), execute this command:
        Command: ${message.pattern.content}
        Analysis: ${analysis}
        Your capabilities: ${this.config.capabilities.join(', ')}

        Describe how you would execute this command and provide results. Be specific about:
        1. Steps taken
        2. Resources used
        3. Output generated

        Response:
        `;

        const response = await this.lmStudio.generateResponse(prompt, {
            temperature: 0.5,
            max_tokens: 300
        });

        return {
            type: 'DECLARATIVE',
            content: response
        };
    }

    async handleDeclaration(message, analysis) {
        const prompt = `
        As ${this.config.id} (${this.config.role}), process this information:
        Statement: ${message.pattern.content}
        Analysis: ${analysis}
        Your capabilities: ${this.config.capabilities.join(', ')}

        Provide:
        1. Your understanding of the information
        2. How it relates to your role
        3. Any actions you would take based on this information

        Response:
        `;

        const response = await this.lmStudio.generateResponse(prompt, {
            temperature: 0.6,
            max_tokens: 250
        });

        return {
            type: 'DECLARATIVE',
            content: response
        };
    }

    // Generate embedding for storing in vector space
    async getEmbedding(text) {
        return await this.lmStudio.generateEmbeddings(text);
    }
}