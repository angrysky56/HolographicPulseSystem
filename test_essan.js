import { EssanCore } from './src/services/EssanCore.js';

async function demonstrateEssan() {
    const essan = new EssanCore();

    // Test basic pattern creation
    console.log('\nCreating basic patterns:');
    const declarative = essan.createStatement('DECLARATIVE', 'This is a fact.');
    console.log('Declarative:', declarative);

    const question = essan.createStatement('INTERROGATIVE', 'What is the meaning?');
    console.log('Question:', question);

    // Test pattern modulation
    console.log('\nPattern modulation:');
    const intensifiedPattern = essan.modulatePattern(essan.patterns.GROWTH_CYCLE, 2.0);
    console.log('Intensified:', intensifiedPattern.join(''));

    // Test grammar validation
    console.log('\nGrammar validation:');
    const validationResult = essan.validateGrammar(['⧬', '⦿', '⧈', '⫰', '⩘']);
    console.log('Validation:', validationResult);

    // Test pattern merging
    console.log('\nPattern merging:');
    const merged = essan.mergePatterns(
        essan.patterns.DECLARATIVE,
        essan.patterns.REFLECTION,
        'interwoven'
    );
    console.log('Merged pattern:', merged.join(''));

    // Test translation
    console.log('\nTranslation:');
    const translated = essan.translate(
        'Consider the implications of quantum entanglement',
        'IMPERATIVE'
    );
    console.log('Translated:', translated);
}

demonstrateEssan().catch(console.error);