export class LMQLProcessor {
    constructor(lmStudioService) {
        this.lmStudio = lmStudioService;
    }

    /**
     * Process an LMQL query for a node
     * Sample queries:
     * - "node.priorityWeight > 0.8 AND context.relevanceScore > node.activationThreshold"
     * - "node.type == 'tool' AND context.contains('search')"
     */
    async processQuery(query, node, context) {
        // Convert the LMQL query into a natural language question for the LM
        const prompt = `
Given node properties: ${JSON.stringify(node)}
And context: ${JSON.stringify(context)}
Should this node be activated based on the following criteria?
${query}

Answer only YES or NO.`;

        const result = await this.lmStudio.evaluateQuery(prompt, {
            node,
            context
        });

        return result.toLowerCase().includes('yes');
    }

    /**
     * Evaluate semantic relevance between node content and current context
     */
    async evaluateRelevance(nodeContent, contextContent) {
        const nodeEmbedding = await this.lmStudio.generateEmbeddings(nodeContent);
        const contextEmbedding = await this.lmStudio.generateEmbeddings(contextContent);

        // Calculate cosine similarity between embeddings
        const similarity = this.cosineSimilarity(nodeEmbedding, contextEmbedding);
        return similarity;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
        const mag1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
        const mag2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
        return dotProduct / (mag1 * mag2);
    }
}