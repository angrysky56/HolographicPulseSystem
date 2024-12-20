import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Proxy to LM Studio
app.post('/v1/*', async (req, res) => {
    try {
        const lmStudioUrl = process.env.LM_STUDIO_URL || 'http://host.docker.internal:1234';
        const response = await axios({
            method: 'post',
            url: `${lmStudioUrl}${req.path}`,
            data: req.body,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying to LM Studio:', error.message);
        res.status(error.response?.status || 500).json({
            error: {
                message: error.message,
                details: error.response?.data
            }
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
});