import fetch from 'node-fetch';

async function testLMStudioAPI() {
    const baseUrl = 'http://192.168.1.82:1234/v1';
    
    // Test embedding endpoint
    const embeddingResponse = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: "Testing the embedding generation capability",
            model: "text-embedding-nomic-embed-text-v1.5@Q8_0"
        })
    });
    
    const embeddingResult = await embeddingResponse.json();
    console.log('Embedding Response:', JSON.stringify(embeddingResult, null, 2));

    // Test completion endpoint
    const completionResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [{
                role: "user",
                content: "What are the key principles of effective agent communication?"
            }],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    const completionResult = await completionResponse.json();
    console.log('Completion Response:', JSON.stringify(completionResult, null, 2));
}

console.log('Starting LM Studio API Test...');
testLMStudioAPI().catch(console.error);