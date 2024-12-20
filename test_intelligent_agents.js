import { EssanAgentNetwork } from './src/services/EssanAgentNetwork.js';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function demonstrateIntelligentAgents() {
    console.log('Creating agent network...');
    const network = new EssanAgentNetwork();

    // Initialize agents with more detailed roles
    console.log('\nInitializing first agent - Data Analyst...');
    const analyst = await network.initializeAgent({
        id: 'data_analyst',
        role: 'Analytical Agent specialized in pattern recognition',
        capabilities: ['analyze', 'visualize', 'report']
    });
    console.log('Data Analyst initialized:', analyst);

    await delay(1000); // Add delay between operations

    console.log('\nInitializing second agent - Knowledge Keeper...');
    const keeper = await network.initializeAgent({
        id: 'knowledge_keeper',
        role: 'Knowledge Management Agent',
        capabilities: ['store', 'retrieve', 'connect']
    });
    console.log('Knowledge Keeper initialized:', keeper);

    await delay(1000);

    // Connect agents
    console.log('\nAttempting to connect agents...');
    try {
        await network.connectAgents(analyst.id, keeper.id);
        console.log('Successfully connected agents');
    } catch (error) {
        console.error('Failed to connect agents:', error);
    }

    await delay(1000);

    // Simple test message
    console.log('\nSending test message between agents...');
    try {
        const message = await network.sendPattern(
            analyst.id,
            keeper.id,
            'DECLARATIVE',
            'Testing agent communication system'
        );
        console.log('Message sent:', message);

        console.log('\nProcessing message queue...');
        await network.processMessageQueue();
        console.log('Message queue processed');
    } catch (error) {
        console.error('Error in message processing:', error);
    }

    // Show final state
    console.log('\nFinal network state:');
    const activeAgents = network.getActiveAgents();
    console.log('Active agents:', JSON.stringify(activeAgents, null, 2));
}

// Run the demonstration with error handling
console.log('Starting Intelligent Agent Network Demonstration...');
demonstrateIntelligentAgents().catch(error => {
    console.error('Demonstration failed:', error);
    console.error('Error stack:', error.stack);
});