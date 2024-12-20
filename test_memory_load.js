import fetch from 'node-fetch';

const TEST_MEMORIES = [
    {
        content: "The sky was particularly blue today, with scattered cirrus clouds forming intricate patterns.",
        type: "DECLARATIVE",
        metadata: { category: "observation", confidence: 0.95 }
    },
    {
        content: "How do neural networks process sequential information effectively?",
        type: "INTERROGATIVE",
        metadata: { category: "technical", domain: "machine_learning" }
    },
    {
        content: "The pattern matching algorithm showed 87% accuracy on the test dataset.",
        type: "SYNTHESIS",
        metadata: { category: "analysis", confidence: 0.92 }
    },
    {
        content: "Begin optimization sequence on memory retrieval pathways.",
        type: "IMPERATIVE",
        metadata: { category: "system", priority: "high" }
    },
    {
        content: "The recursive pattern identified in the data suggests a fractal structure.",
        type: "REFLECTION",
        metadata: { category: "insight", confidence: 0.89 }
    }
];

const SEARCH_QUERIES = [
    "patterns in nature",
    "machine learning concepts",
    "system optimization",
    "data analysis results",
    "cognitive observations"
];

async function runTest() {
    console.log('Starting memory load test...');
    
    // Use Docker service name instead of localhost
    const HOST = 'http://mcp_memory:8001';
    
    // Store memories
    for (const memory of TEST_MEMORIES) {
        try {
            const response = await fetch(`${HOST}/memories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memory)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log(`Memory stored: ${memory.content.slice(0, 30)}...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Space out requests
        } catch (error) {
            console.error('Error storing memory:', error);
        }
    }

    // Run searches
    for (const query of SEARCH_QUERIES) {
        try {
            const response = await fetch(`${HOST}/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, limit: 3 })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log(`Search executed: ${query}`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Space out searches
        } catch (error) {
            console.error('Error executing search:', error);
        }
    }

    // Get analytics
    try {
        const response = await fetch(`${HOST}/analytics`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const analytics = await response.json();
        console.log('Current analytics:', analytics);
    } catch (error) {
        console.error('Error getting analytics:', error);
    }
}

// Add this Docker network utility
const { execSync } = require('child_process');

// Get Docker network info
try {
    console.log('Docker network configuration:');
    console.log(execSync('docker network ls').toString());
    console.log('\nDetailed network info:');
    console.log(execSync('docker inspect holographic-pulse-system_milvus-net').toString());
} catch (error) {
    console.error('Error getting network info:', error);
}

console.log('Running memory system load test...');
runTest().catch(console.error);