import { LMStudioService } from './src/services/LMStudioService.js';

async function testChat() {
    console.log('Testing LM Studio chat...');
    const lmStudio = new LMStudioService();
    
    const response = await lmStudio.generateResponse(
        "You are a helpful AI assistant. What capabilities do you have?"
    );
    
    console.log('\nResponse:', response);
}

testChat().catch(console.error);