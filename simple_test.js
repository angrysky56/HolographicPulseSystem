import { EssanAgentNetwork } from './src/services/EssanAgentNetwork.js';

async function simpleTest() {
    console.log('Creating network...');
    const network = new EssanAgentNetwork();

    console.log('Creating test agent...');
    const agent = await network.initializeAgent({
        id: 'test_agent',
        role: 'tester',
        capabilities: ['test']
    });

    console.log('Agent created:', agent);
}

simpleTest().catch(console.error);