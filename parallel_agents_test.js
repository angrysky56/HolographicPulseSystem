import { EssanAgentNetwork } from './src/services/EssanAgentNetwork.js';

// Create two parallel analysis workflows
async function launchParallelAnalysis() {
    const network = new EssanAgentNetwork();
    
    // Define specialized agents with different tool capabilities
    const agents = [
        {
            id: 'data_processor',
            role: 'Data Processing Agent',
            capabilities: ['parse_data', 'clean_data'],
            tools: ['python_repl', 'file_system']
        },
        {
            id: 'pattern_finder',
            role: 'Pattern Analysis Agent',
            capabilities: ['find_patterns', 'statistical_analysis'],
            tools: ['calculator', 'database']
        },
        {
            id: 'insight_generator',
            role: 'Insight Generation Agent',
            capabilities: ['summarize', 'generate_insights'],
            tools: ['search', 'web_browser']
        }
    ];

    console.log('Launching parallel agent initialization...');
    
    // Initialize all agents in parallel
    const initPromises = agents.map(agent => 
        network.initializeAgent(agent)
            .then(() => console.log(`${agent.id} initialization launched`))
    );

    // Create bidirectional connections after initialization
    Promise.all(initPromises).then(() => {
        console.log('Creating agent network connections...');
        return Promise.all([
            network.connectAgents('data_processor', 'pattern_finder'),
            network.connectAgents('pattern_finder', 'insight_generator'),
            network.connectAgents('data_processor', 'insight_generator')
        ]);
    }).then(() => {
        // Launch parallel analysis workflows
        console.log('Launching parallel analysis workflows...');
        
        // Workflow 1: Data Processing -> Pattern Finding
        network.sendPattern(
            'data_processor',
            'pattern_finder',
            'DECLARATIVE',
            JSON.stringify({
                action: 'analyze',
                data: 'sample_dataset',
                tool_sequence: ['python_repl', 'calculator']
            })
        );

        // Workflow 2: Pattern Finding -> Insight Generation
        network.sendPattern(
            'pattern_finder',
            'insight_generator',
            'SYNTHESIS',
            JSON.stringify({
                action: 'synthesize',
                patterns: ['pattern1', 'pattern2'],
                tool_sequence: ['database', 'search']
            })
        );

        // Direct workflow: Data -> Insights
        network.sendPattern(
            'data_processor',
            'insight_generator',
            'REFLECTION',
            JSON.stringify({
                action: 'direct_analysis',
                data: 'raw_input',
                tool_sequence: ['file_system', 'web_browser']
            })
        );
    });

    console.log('Analysis workflows launched - running asynchronously');
}

// Launch the parallel analysis
console.log('Starting parallel agent analysis system...');
launchParallelAnalysis().catch(console.error);