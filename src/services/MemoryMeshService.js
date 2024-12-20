import { Node } from './Node.js';
import { PulseSystem } from './PulseSystem.js';

export class MemoryMeshService {
    constructor() {
        this.nodes = new Map();
        this.pulseSystem = new PulseSystem();
        this.lastId = 0;
    }

    /**
     * Create a new memory node
     * @param {Object} content - Content to store in the node
     * @returns {Promise<Object>} - Created node information
     */
    async addMemory(content) {
        const id = String(++this.lastId);
        const node = new Node({
            id,
            content,
            type: 'memory',
            metadata: {
                source: 'user',
                timestamp: new Date().toISOString()
            }
        });
        
        this.nodes.set(id, node);
        
        // Automatically connect to recent nodes based on time proximity
        await this._connectToRecentNodes(node);
        
        // Start a pulse from this new node
        await this.pulseSystem.propagatePulse(node);
        
        return { id, status: 'success' };
    }

    /**
     * Retrieve a memory node
     * @param {string} id - Node ID
     * @returns {Promise<Object>} - Node data
     */
    async getMemory(id) {
        const node = this.nodes.get(String(id));
        if (!node) {
            throw new Error('Memory not found');
        }
        
        // Update access metadata and propagate pulse
        node.updateAccessMetadata();
        await this.pulseSystem.propagatePulse(node, 0.8); // Slightly reduced initial pulse
        
        return node.toJSON();
    }

    /**
     * List all memory nodes
     * @returns {Promise<Array<Object>>} - Array of all nodes
     */
    async listMemories() {
        return Array.from(this.nodes.values()).map(node => node.toJSON());
    }

    /**
     * Search for memories based on query
     * @param {string} query - Search query
     * @returns {Promise<Array<Object>>} - Search results
     */
    async searchMemories(query) {
        // For now, return memories sorted by relevance weight
        // TODO: Implement proper vector similarity search
        return Array.from(this.nodes.values())
            .sort((a, b) => b.getEffectiveRelevance() - a.getEffectiveRelevance())
            .map(node => node.toJSON());
    }

    /**
     * Get currently active nodes
     * @returns {Promise<Array<Object>>} - Active nodes
     */
    async getActiveNodes() {
        const activeIds = this.pulseSystem.getActiveNodes();
        return Array.from(activeIds)
            .map(id => this.nodes.get(id))
            .filter(Boolean)
            .map(node => node.toJSON());
    }

    /**
     * Connect a node to recent nodes based on time proximity
     * @private
     * @param {Node} node - Node to connect
     */
    async _connectToRecentNodes(node) {
        const RECENT_THRESHOLD = 1000 * 60 * 60; // 1 hour
        const MAX_CONNECTIONS = 5;
        
        const recentNodes = Array.from(this.nodes.values())
            .filter(n => n.id !== node.id)
            .filter(n => {
                const timeDiff = new Date() - new Date(n.metadata.created);
                return timeDiff < RECENT_THRESHOLD;
            })
            .slice(0, MAX_CONNECTIONS);

        for (const recentNode of recentNodes) {
            const weight = 0.8; // Initial connection weight
            node.addNeighbor(recentNode, weight);
            recentNode.addNeighbor(node, weight);
        }
    }
}