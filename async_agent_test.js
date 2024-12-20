import { EssanAgentNetwork } from './src/services/EssanAgentNetwork.js';

// Launch test without waiting
const network = new EssanAgentNetwork();

// Initialize test agents
const testAgent1 = {
    id: 'pattern_analyzer',
    role: 'Pattern Analysis Agent',
    capabilities: ['analyze_patterns', 'detect_anomalies']
};

const testAgent2 = {
    id: 'knowledge_synth',
    role: 'Knowledge Synthesis Agent',
    capabilities: ['merge_concepts', 'generate_insights'] 
};

// Track initialization promises but don't wait for them
console.log('Launching agent initialization...');
const init1 = network.initializeAgent(testAgent1)
    .then(() => console.log('Agent 1 initialization complete'))
    .catch(console.error);

const init2 = network.initializeAgent(testAgent2)
    .then(() => console.log('Agent 2 initialization complete'))
    .catch(console.error);

// Launch connection after initialization
Promise.all([init1, init2]).then(() => {
    console.log('Connecting agents...');
    return network.connectAgents('pattern_analyzer', 'knowledge_synth');
}).then(() => {
    console.log('Launching pattern exchange...');
    return network.sendPattern(
        'pattern_analyzer',
        'knowledge_synth',
        'DECLARATIVE',
        'Testing asynchronous pattern transmission'
    );
}).then(() => {
    console.log('Pattern transmission launched');
}).catch(console.error);

console.log('Test launch complete - system running asynchronously');