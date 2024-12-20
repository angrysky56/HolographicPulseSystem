export class Node {
    constructor({
        id,
        content,
        type = 'memory',
        metadata = {},
        embedding = null,
        relevanceWeight = 0.5,
        activationQuery = null
    }) {
        this.id = id;
        this.content = content;
        this.type = type;
        this.metadata = {
            ...metadata,
            created: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            accessCount: 0
        };
        this.embedding = embedding;
        this.relevanceWeight = relevanceWeight;
        this.neighbors = new Map(); // Map<nodeId, edgeWeight>
        this.activationQuery = activationQuery || this.getDefaultActivationQuery();
    }

    getDefaultActivationQuery() {
        return `
        node.type == '${this.type}' AND 
        context.relevanceScore > ${this.metadata.activationThreshold || 0.7} AND
        node.getEffectiveRelevance() > 0.5
        `;
    }

    addNeighbor(node, weight = 1.0) {
        this.neighbors.set(node.id, weight);
    }

    removeNeighbor(node) {
        this.neighbors.delete(node.id);
    }

    getNeighborIds() {
        return Array.from(this.neighbors.keys());
    }

    updateAccessMetadata() {
        this.metadata.lastAccessed = new Date().toISOString();
        this.metadata.accessCount += 1;
    }

    adjustRelevanceWeight(feedbackScore) {
        const adjustment = feedbackScore * 0.1;
        this.relevanceWeight = Math.max(0.1, Math.min(1.0, this.relevanceWeight + adjustment));
    }

    getTemporalDecay() {
        const now = new Date();
        const lastAccessed = new Date(this.metadata.lastAccessed);
        const hoursSinceAccess = (now - lastAccessed) / (1000 * 60 * 60);
        return Math.exp(-hoursSinceAccess / 24);
    }

    getEffectiveRelevance() {
        return this.relevanceWeight * this.getTemporalDecay();
    }

    /**
     * Create a specialized node for storing tool/capability information
     */
    static createToolNode(toolName, description, usage) {
        return new Node({
            id: `tool_${toolName}`,
            content: {
                name: toolName,
                description,
                usage
            },
            type: 'tool',
            metadata: {
                activationThreshold: 0.6, // Tools should be fairly easy to activate
                category: 'capability'
            },
            // Custom activation query for tools
            activationQuery: `
            node.type == 'tool' AND (
                context.contains(node.content.name) OR
                context.relevanceScore > 0.8 OR
                context.taskType == node.content.usage
            )`
        });
    }

    toJSON() {
        return {
            id: this.id,
            content: this.content,
            type: this.type,
            metadata: this.metadata,
            embedding: this.embedding,
            relevanceWeight: this.relevanceWeight,
            neighbors: Array.from(this.neighbors.entries()),
            activationQuery: this.activationQuery
        };
    }
}