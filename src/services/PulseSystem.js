/**
 * PulseSystem handles the propagation of activation waves through the memory mesh
 */
export class PulseSystem {
    constructor() {
        this.activationThreshold = 0.7;
        this.propagationDecay = 0.15;
        this.activeNodes = new Set();
    }

    /**
     * Propagates an activation pulse through the memory mesh
     * @param {Node} startNode - The node where the pulse originates
     * @param {number} initialStrength - Initial strength of the pulse
     */
    async propagatePulse(startNode, initialStrength = 1.0) {
        const queue = [{node: startNode, strength: initialStrength}];
        const visited = new Set();

        while (queue.length > 0) {
            const {node, strength} = queue.shift();
            
            if (visited.has(node.id)) continue;
            visited.add(node.id);

            if (strength >= this.activationThreshold) {
                this.activeNodes.add(node.id);
                
                // Get neighboring nodes
                const neighbors = await node.getNeighbors();
                
                // Propagate to neighbors with reduced strength
                for (const neighbor of neighbors) {
                    const newStrength = strength * (1 - this.propagationDecay) * neighbor.relevanceWeight;
                    if (newStrength >= this.activationThreshold) {
                        queue.push({node: neighbor, strength: newStrength});
                    }
                }
            }
        }
    }

    /**
     * Check if a node is currently active
     * @param {string} nodeId - ID of the node to check
     * @returns {boolean} - Whether the node is active
     */
    isNodeActive(nodeId) {
        return this.activeNodes.has(nodeId);
    }

    /**
     * Deactivate a specific node
     * @param {string} nodeId - ID of the node to deactivate
     */
    deactivateNode(nodeId) {
        this.activeNodes.delete(nodeId);
    }

    /**
     * Get all currently active nodes
     * @returns {Set<string>} - Set of active node IDs
     */
    getActiveNodes() {
        return new Set(this.activeNodes);
    }

    /**
     * Clear all active nodes
     */
    clearActiveNodes() {
        this.activeNodes.clear();
    }
}