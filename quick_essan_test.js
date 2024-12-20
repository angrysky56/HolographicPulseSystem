import { MilvusService } from './src/services/MilvusService.js';
import { EssanPatternService } from './src/services/EssanPatternService.js';

async function demonstrateEssan() {
    const milvus = new MilvusService();
    const essan = new EssanPatternService(milvus);

    console.log('Creating growth pattern...');
    const growthPattern = await essan.executeGrowthPattern('Learning new concept');
    console.log(JSON.stringify(growthPattern, null, 2));

    console.log('\nCreating temporary bubble...');
    const bubble = await essan.createTemporaryBubble(growthPattern);
    console.log(JSON.stringify(bubble, null, 2));

    // Create two patterns and merge them
    console.log('\nDemonstrating pattern merge...');
    const pattern1 = await essan.executeGrowthPattern('Pattern Analysis');
    const pattern2 = await essan.executeGrowthPattern('Knowledge Integration');
    const merged = await essan.mergePatterns(pattern1, pattern2);
    console.log(JSON.stringify(merged, null, 2));
}

demonstrateEssan().catch(console.error);