import { EssanAgentNetwork } from './src/services/EssanAgentNetwork.js';

async function demonstrateAgentNetwork() {
    const network = new EssanAgentNetwork();

    // Initialize some agents
    console.log('\nInitializing agents...');
    const agent1 = await network.initializeAgent({
        id: 'analysis_agent',
        role: 'data_analyst',
        capabilities: ['analyze', 'visualize', 'report']
    });

    const agent2 = await network.initializeAgent({
        id: 'memory_agent',
        role: 'knowledge_keeper',
        capabilities: ['store', 'retrieve', 'connect']
    });

    console.log('Agents initialized:', {
        agent1: agent1.id,
        agent2: agent2.id
    });

    // Connect agents
    console.log('\nConnecting agents...');
    await network.connectAgents(agent1.id, agent2.id);
    console.log('Agents connected');

    // Send some patterns between agents
    console.log('\nSending patterns...');
    const message1 = await network.sendPattern(
        agent1.id,
        agent2.id,
        'INTERROGATIVE',
        'What data patterns have you observed?'
    );

    const message2 = await network.sendPattern(
        agent2.id,
        agent1.id,
        'IMPERATIVE',
        'Analyze recent user interactions'
    );

    console.log('Messages sent:', {
        message1: message1.id,
        message2: message2.id
    });

    // Process messages
    console.log('\nProcessing message queue...');
    await network.processMessageQueue();
    console.log('Messages processed');

    // Check agent states
    console.log('\nActive agents:', network.getActiveAgents());
}

demonstrateAgentNetwork().catch(console.error);