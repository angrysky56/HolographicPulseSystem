# Holographic Pulse System
![Screenshot 2024-12-19 180143](https://github.com/user-attachments/assets/95e56079-7035-40d0-8323-5ec31028876e)

A dynamic, self-activating node memory framework that combines LM Studio's local models with Milvus vector database for intelligent agent interactions.

## Overview

The Holographic Pulse System (HPS) creates a network of intelligent agents that can:
- Communicate using Essan symbolic patterns
- Store knowledge in vector space
- Process natural language using local models
- Self-organize and activate based on context

## Prerequisites

- Node.js v18+
- Docker & Docker Compose
- LM Studio (for local model inference)
- 16GB RAM recommended
- Quite a bit of space for Docker images!!!
## Quick Start

1. Clone the repository
```bash
git clone https://github.com/yourusername/Holographic-Pulse-System.git
cd Holographic-Pulse-System
```

2. Install dependencies
```bash
npm install
```

3. Start required services
```bash
docker-compose up -d
```

4. Launch LM Studio and load models:
   - Start LM Studio
   - Load embedding model (e.g., text-embedding-nomic-embed-text)
   - Load chat/instruction model(s) of your choice
   - Start server (default port: 1234)

5. Run tests
```bash
npm run test:essan     # Test Essan patterns
npm run test:agents    # Test agent network
```

## Architecture

### Components

1. **Agent Network**
   - EssanAgentNetwork: Manages agent creation and communication
   - AgentBrain: Handles agent reasoning and decision making
   - LMStudioService: Interfaces with local models

2. **Vector Storage**
   - MilvusService: Manages vector storage and retrieval
   - Supports semantic search and pattern matching

3. **Symbolic Language**
   - EssanCore: Implements Essan symbolic patterns
   - Enables structured agent communication

### Directory Structure

```
Holographic-Pulse-System/
├── src/
│   ├── services/
│   │   ├── EssanAgentNetwork.js
│   │   ├── AgentBrain.js
│   │   ├── LMStudioService.js
│   │   ├── MilvusService.js
│   │   └── EssanCore.js
│   └── index.js
├── config/
│   ├── prometheus/
│   └── grafana/
├── docker-compose.yml
└── tests/
```

## Configuration

### LM Studio Setup

1. Required Models:
   - Embedding model (for vector creation)
   - Instruction model(s) (for agent reasoning)

2. Server Configuration:
   - Default port: 1234
   - Enable CORS
   - Local network access if needed

### Docker Services

- Milvus (vector database)
- Etcd (metadata storage)
- MinIO (object storage)
- Prometheus & Grafana (monitoring)

## Usage Examples

1. Create Agent Network:
```javascript
const network = new EssanAgentNetwork();

// Initialize agents
const analyst = await network.initializeAgent({
    id: 'data_analyst',
    role: 'Analytical Agent',
    capabilities: ['analyze', 'visualize', 'report']
});

const keeper = await network.initializeAgent({
    id: 'knowledge_keeper',
    role: 'Knowledge Management Agent',
    capabilities: ['store', 'retrieve', 'connect']
});

// Connect agents
await network.connectAgents(analyst.id, keeper.id);
```

2. Send Messages:
```javascript
await network.sendPattern(
    analyst.id,
    keeper.id,
    'INTERROGATIVE',
    'What patterns have you observed?'
);

await network.processMessageQueue();
```

## Monitoring

- Grafana dashboard available at http://localhost:3000
- Default credentials: admin/admin
- Pre-configured dashboards for:
  - Agent activities
  - Vector operations
  - System metrics

## Development

1. Run in development mode:
```bash
npm run dev
```

2. Access API endpoints:
   - Main API: http://localhost:5000
   - Milvus: http://localhost:19530
   - Monitoring: http://localhost:3000

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## License

MIT License - see LICENSE file for details
