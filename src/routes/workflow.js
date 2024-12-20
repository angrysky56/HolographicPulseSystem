import express from 'express';
import { AsyncWorkflowManager } from '../services/AsyncWorkflowManager.js';

const router = express.Router();
const workflowManager = new AsyncWorkflowManager();

// Start a new workflow
router.post('/workflow', async (req, res) => {
    try {
        const workflow = req.body;
        const workflowId = await workflowManager.startWorkflow(workflow);
        res.json({ 
            workflowId,
            message: 'Workflow started successfully',
            status: 'running'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get workflow status
router.get('/workflow/:id/status', (req, res) => {
    const status = workflowManager.getWorkflowStatus(req.params.id);
    if (!status) {
        res.status(404).json({ error: 'Workflow not found' });
        return;
    }
    res.json(status);
});

// Get workflow results
router.get('/workflow/:id/results', (req, res) => {
    const results = workflowManager.getWorkflowResults(req.params.id);
    if (!results) {
        res.status(404).json({ error: 'Results not found' });
        return;
    }
    res.json(results);
});

export default router;