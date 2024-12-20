import { MilvusService } from './MilvusService.js';
import { EssanCore } from './EssanCore.js';
import { AgentBrain } from './AgentBrain.js';

export class EssanAgentNetwork {
    constructor() {
        this.milvus = new MilvusService('agent_memory', 384);
        this.essan = new EssanCore();
        this.agents = new Map();
        this.brains = new Map();
        this.messageQueue = [];
        this.connections = new Map();
    }

    async initialize() {
        await this.milvus.initialize();
    }

    async initializeAgent(config) {
        await this.initialize();
        
        const agent = {
            id: config.id,
            role: config.role,
            capabilities: config.capabilities,
            status: 'active',
            pattern: this.essan.createStatement('DECLARATIVE', `Agent ${config.id} initialized`),
            lastUpdate: new Date(),
            memoryIds: [],
            connections: new Set()
        };

        // Create agent brain
        const brain = new AgentBrain(config);
        this.brains.set(config.id, brain);

        // Store agent's initial state in vector space
        const embedding = await brain.getEmbedding(`${config.role} with capabilities: ${config.capabilities.join(', ')}`);
        await this.milvus.insertVector(
            `agent_${config.id}`,
            embedding,
            {
                type: 'agent_state',
                role: config.role,
                capabilities: JSON.stringify(config.capabilities)
            }
        );

        this.agents.set(config.id, agent);
        return agent;
    }

    async connectAgents(agent1Id, agent2Id) {
        const agent1 = this.agents.get(agent1Id);
        const agent2 = this.agents.get(agent2Id);

        if (!agent1 || !agent2) {
            throw new Error('One or both agents not found');
        }

        // Add bidirectional connection
        agent1.connections.add(agent2Id);
        agent2.connections.add(agent1Id);

        // Store connection in vector space
        const connectionId = `connection_${agent1Id}_${agent2Id}`;
        const brain1 = this.brains.get(agent1Id);
        const connectionEmbedding = await brain1.getEmbedding(
            `Connection between ${agent1Id} (${agent1.role}) and ${agent2Id} (${agent2.role})`
        );

        await this.milvus.insertVector(
            connectionId,
            connectionEmbedding,
            {
                type: 'agent_connection',
                agent1: agent1Id,
                agent2: agent2Id,
                timestamp: new Date().toISOString()
            }
        );

        console.log(`Connected agents: ${agent1Id} <-> ${agent2Id}`);
        return { agent1, agent2 };
    }

    async sendPattern(fromId, toId, patternType, content) {
        const sender = this.agents.get(fromId);
        const receiver = this.agents.get(toId);

        if (!sender || !receiver) {
            throw new Error('Sender or receiver not found');
        }

        if (!sender.connections.has(toId)) {
            throw new Error('Agents are not connected');
        }

        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fromId,
            toId,
            pattern: this.essan.createStatement(patternType, content),
            timestamp: new Date(),
            status: 'pending'
        };

        // Store message with embedding
        const brain = this.brains.get(fromId);
        const embedding = await brain.getEmbedding(content);
        
        await this.milvus.insertVector(
            message.id,
            embedding,
            {
                type: 'agent_message',
                fromId,
                toId,
                content: JSON.stringify(content),
                status: message.status
            }
        );

        this.messageQueue.push(message);
        return message;
    }

    async processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            
            try {
                const receiver = this.agents.get(message.toId);
                const brain = this.brains.get(message.toId);

                if (!receiver || !brain) {
                    throw new Error(`Receiver ${message.toId} not found`);
                }

                // Process message using receiver's brain
                const response = await brain.processMessage(message);

                // Send response back
                if (response) {
                    await this.sendPattern(
                        message.toId,
                        message.fromId,
                        response.type,
                        response.content
                    );
                }

                // Update message status
                message.status = 'processed';
                await this.updateMessageStatus(message);
                
                console.log(`Processed message ${message.id} from ${message.fromId} to ${message.toId}`);
            } catch (error) {
                console.error(`Error processing message ${message.id}:`, error);
                message.status = 'failed';
                await this.updateMessageStatus(message);
            }
        }
    }

    async updateMessageStatus(message) {
        const brain = this.brains.get(message.toId);
        const embedding = await brain.getEmbedding(
            `${message.pattern.content} (${message.status})`
        );

        await this.milvus.updateVector(
            message.id,
            embedding,
            {
                type: 'agent_message',
                fromId: message.fromId,
                toId: message.toId,
                content: JSON.stringify(message.pattern.content),
                status: message.status
            }
        );
    }

    getActiveAgents() {
        return Array.from(this.agents.values())
            .filter(agent => agent.status === 'active')
            .map(agent => ({
                id: agent.id,
                role: agent.role,
                capabilities: agent.capabilities,
                connections: Array.from(agent.connections)
            }));
    }
}