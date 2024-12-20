import axios from 'axios';

const checkLMStudio = async () => {
    const maxAttempts = 10;
    const delayBetweenAttempts = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await axios.post('http://localhost:1234/v1/chat/completions', {
                model: "meta-llama-3.1-8b-instruct-abliterated:2",
                messages: [
                    { role: "user", content: "test" }
                ]
            });
            
            if (response.status === 200) {
                console.log('LM Studio is ready!');
                process.exit(0);
            }
        } catch (error) {
            console.log(`Attempt ${attempt}/${maxAttempts}: LM Studio not ready yet...`);
            if (attempt === maxAttempts) {
                console.error('Failed to connect to LM Studio after maximum attempts');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        }
    }
};

checkLMStudio();