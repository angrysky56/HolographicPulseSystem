import express from 'express';
import cors from 'cors';
import { MemoryMeshService } from './services/MemoryMeshService.js';
import workflowRoutes from './routes/workflow.js';

const app = express();
const port = process.env.PORT || 5000;

// Enable JSON parsing and CORS
app.use(express.json());
app.use(cors());

// Initialize services
const memoryService = new MemoryMeshService();

// Add workflow routes
app.use('/api', workflowRoutes);

// Original memory endpoints...
// [Previous endpoints remain the same]

app.listen(port, () => {
    console.log(`Memory Mesh Service listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});