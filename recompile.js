// Recompile BananaToken with proper library linking
const fs = require('fs');
const solc = require('solc');

const source = fs.readFileSync('BananaToken_fixed.sol', 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'BananaToken_fixed.sol': {
            content: source
        }
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode.object', 'evm.bytecode.linkReferences']
            }
        }
    }
};

console.log('Compiling with solc', solc.version());
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    for (const err of output.errors) {
        if (err.severity === 'error') {
            console.error('COMPILE ERROR:', err.message);
        } else {
            console.warn('Warning:', err.message);
        }
    }
}

// Extract all contracts
const contracts = output.contracts['BananaToken_fixed.sol'];
const result = {};

for (const [name, data] of Object.entries(contracts)) {
    const bytecode = data.evm.bytecode.object;
    const linkRefs = data.evm.bytecode.linkReferences;
    
    console.log(`\n=== ${name} ===`);
    console.log(`  Bytecode length: ${bytecode.length}`);
    console.log(`  Has link references: ${JSON.stringify(linkRefs)}`);
    
    // Check for placeholders
    const placeholderPattern = /__\$[0-9a-f]+\$__/g;
    const placeholders = bytecode.match(placeholderPattern) || [];
    console.log(`  Placeholders: ${placeholders.length > 0 ? placeholders : 'None'}`);
    
    result[name] = {
        bytecode: bytecode,
        abi: data.abi,
        linkReferences: linkRefs
    };
}

// Write full output
fs.writeFileSync('recompiled_output.json', JSON.stringify(result, null, 2));
console.log('\nSaved to recompiled_output.json');

// Also write a combined file with just what the HTML needs
const htmlData = {
    libBytecode: result.IterableMapping ? result.IterableMapping.bytecode : null,
    libAbi: result.IterableMapping ? JSON.stringify(result.IterableMapping.abi) : null,
    implBytecode: result.BABYTOKENDividendTracker ? result.BABYTOKENDividendTracker.bytecode : null,
    implAbi: result.BABYTOKENDividendTracker ? JSON.stringify(result.BABYTOKENDividendTracker.abi) : null,
    mainBytecode: result.BananaToken ? result.BananaToken.bytecode : null,
    mainAbi: result.BananaToken ? JSON.stringify(result.BananaToken.abi) : null,
    linkReferences: result.BABYTOKENDividendTracker ? result.BABYTOKENDividendTracker.linkReferences : {}
};
fs.writeFileSync('deploy_data.json', JSON.stringify(htmlData, null, 2));
console.log('Saved deploy_data.json');
