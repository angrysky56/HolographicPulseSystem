import express from 'express';
import { MilvusService } from './MilvusService.js';
import { EssanCore } from './EssanCore.js';
import { LMStudioService } from './LMStudioService.js';
import client from 'prom-client';

// Create Express app
const app = express();
app.use(express.json());

// Initialize services
const milvus = new MilvusService('memory_collection', 384);
const essan = new EssanCore();
const lmStudio = new LMStudioService();

// Create Prometheus metrics
const insertionCounter = new client.Counter({
    name: 'memory_insertions_total',
    help: 'Total number of memory insertions',
    labelNames: ['status']
});

const queryCounter = new client.Counter({
    name: 'memory_queries_total',
    help: 'Total number of memory queries',
    labelNames: ['status']
});

const processingDuration = new client.Histogram({
    name: 'memory_processing_duration_seconds',
    help: 'Duration of memory processing operations',
    buckets: [0.1, 0.5, 1, 2, 5],
    labelNames: ['operation', 'status']
});

const activeConnections = new client.Gauge({
    name: 'memory_active_connections',
    help: 'Number of active connections to the memory service'
});

// Initialize Milvus collection on startup
async function initializeService() {
    try {
        await milvus.initialize();
        console.log('Memory service initialized successfully');
    } catch (error) {
        console.error('Failed to initialize memory service:', error);
        process.exit(1);
    }
}

// Store memory with embeddings
app.post('/memories', async (req, res) => {
    const timer = processingDuration.startTimer();
    activeConnections.inc();
    try {
        const { content, type, metadata } = req.body;
        console.log('Processing memory:', content.slice(0, 50), '...');

        // Generate embeddings using LM Studio
        const embedding = await lmStudio.generateEmbeddings(content);
        if (!embedding) throw new Error('Failed to generate embeddings');

        // Create Essan pattern for the memory
        const pattern = essan.createStatement(type || 'DECLARATIVE', content);

        // Store in Milvus
        await milvus.insertVector(
            `memory_${Date.now()}`,
            embedding,
            {
                content,
                pattern: pattern.pattern,
                type: pattern.type,
                metadata: JSON.stringify(metadata || {}),
                timestamp: new Date().toISOString()
            }
        );

        insertionCounter.inc({ status: 'success' });
        timer({ operation: 'insert', status: 'success' });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error storing memory:', error);
        insertionCounter.inc({ status: 'error' });
        timer({ operation: 'insert', status: 'error' });
        res.status(500).json({ error: error.message });
    } finally {
        activeConnections.dec();
    }
});

// Search memories by semantic similarity
app.post('/search', async (req, res) => {
    const timer = processingDuration.startTimer();
    activeConnections.inc();
    try {
        const { query, limit = 10 } = req.body;
        console.log('Processing search:', query);

        // Generate query embeddings
        const embedding = await lmStudio.generateEmbeddings(query);
        if (!embedding) throw new Error('Failed to generate search embeddings');

        // Search in Milvus
        const results = await milvus.searchSimilar(embedding, limit);

        // Process results through LM Studio for enhanced context
        const enhancedResults = await Promise.all(results.map(async (result) => {
            const analysis = await lmStudio.analyzeContext(
                result.content,
                `Query: ${query}\nRelevance: ${result.score}`
            );
            return {
                ...result,
                analysis
            };
        }));

        queryCounter.inc({ status: 'success' });
        timer({ operation: 'search', status: 'success' });
        res.status(200).json(enhancedResults);
    } catch (error) {
        console.error('Error searching memories:', error);
        queryCounter.inc({ status: 'error' });
        timer({ operation: 'search', status: 'error' });
        res.status(500).json({ error: error.message });
    } finally {
        activeConnections.dec();
    }
});

// Get memory analytics
app.get('/analytics', async (req, res) => {
    const timer = processingDuration.startTimer();
    activeConnections.inc();
    try {
        const stats = await milvus.getCollectionStats();
        const metrics = {
            totalMemories: stats.rowCount,
            insertions: {
                success: await insertionCounter.get({ status: 'success' }),
                error: await insertionCounter.get({ status: 'error' })
            },
            queries: {
                success: await queryCounter.get({ status: 'success' }),
                error: await queryCounter.get({ status: 'error' })
            },
            performance: {
                histogram: await processingDuration.get()
            },
            activeConnections: await activeConnections.get()
        };
        timer({ operation: 'analytics', status: 'success' });
        res.status(200).json(metrics);
    } catch (error) {
        console.error('Error getting analytics:', error);
        timer({ operation: 'analytics', status: 'error' });
        res.status(500).json({ error: error.message });
    } finally {
        activeConnections.dec();
    }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        const metrics = await client.register.metrics();
        res.status(200).send(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
const port = process.env.PORT || 8001;
app.listen(port, () => {
    console.log(`Memory service listening on port ${port}`);
    initializeService();
});