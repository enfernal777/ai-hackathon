/**
 * All Connectivity Tests Runner
 * Runs all connectivity tests sequentially
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runTest = (testFile, testName) => {
    return new Promise((resolve, reject) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 Running ${testName}`);
        console.log('='.repeat(60));

        const testProcess = spawn('node', [join(__dirname, testFile)], {
            stdio: 'inherit',
            shell: true
        });

        testProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ name: testName, passed: true });
            } else {
                resolve({ name: testName, passed: false });
            }
        });

        testProcess.on('error', (error) => {
            console.error(`Failed to start ${testName}:`, error);
            resolve({ name: testName, passed: false });
        });
    });
};

const runAllTests = async () => {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║        AI Training Tracker - Connectivity Tests           ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    const tests = [
        { file: 'test-database.js', name: 'Database Connectivity Test' },
        { file: 'test-aws.js', name: 'AWS Services Connectivity Test' }
    ];

    const results = [];

    for (const test of tests) {
        const result = await runTest(test.file, test.name);
        results.push(result);

        // Add a small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Display summary
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                     TEST SUMMARY                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    results.forEach((result, index) => {
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${index + 1}. ${result.name}: ${status}`);
    });

    const allPassed = results.every(r => r.passed);
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    console.log('\n');
    console.log('-'.repeat(60));
    console.log(`Total: ${passedCount}/${totalCount} tests passed`);
    console.log('-'.repeat(60));

    if (allPassed) {
        console.log('\n🎉 All connectivity tests passed successfully!');
        console.log('   Your application is ready to connect to all services.\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
        console.log('   Refer to indotenv.md for environment variable setup.\n');
        process.exit(1);
    }
};

// Run all tests
runAllTests();
