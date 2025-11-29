/**
 * AWS Bedrock Connectivity Test with AUTOMATIC Token Refresh
 * Automatically detects expired tokens and refreshes them without asking
 */

import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const refreshTokens = () => {
    return new Promise((resolve, reject) => {
        console.log('\n⏰ AWS credentials expired! Auto-refreshing...');
        console.log('🔄 Running: python refToken.py');
        console.log('📝 This will open your browser for AWS SSO login...\n');

        const pythonScript = join(__dirname, '..', 'refToken.py');
        const refresh = spawn('python', [pythonScript], {
            stdio: 'inherit',
            shell: true
        });

        refresh.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ Credentials refreshed! Reloading and retrying...\n');
                // Reload .env file
                dotenv.config({ path: join(__dirname, '..', '.env'), override: true });
                resolve(true);
            } else {
                console.error('\n❌ Failed to refresh credentials');
                console.error('Please run manually: python refToken.py\n');
                resolve(false);
            }
        });

        refresh.on('error', (error) => {
            console.error('Error running refresh script:', error);
            reject(error);
        });
    });
};

const testAWSConnection = async () => {
    console.log('🔍 Testing AWS Bedrock Connectivity...\n');

    const regionName = process.env.region_name;
    let accessKeyId = process.env.aws_access_key_id;
    let secretAccessKey = process.env.aws_secret_access_key;
    let sessionToken = process.env.aws_session_token;

    if (!regionName) {
        console.error('❌ Missing region_name in .env\n');
        process.exit(1);
    }

    if (!accessKeyId || !secretAccessKey) {
        console.error('❌ Missing AWS credentials in .env');
        console.error('Run: python refToken.py\n');
        process.exit(1);
    }

    console.log('✓ Environment variables loaded');
    console.log(`  Region: ${regionName}`);
    console.log(`  Access Key: ${accessKeyId.substring(0, 10)}...`);
    console.log();

    const attemptConnection = async (retryCount = 0) => {
        try {
            const bedrockClient = new BedrockRuntimeClient({
                region: regionName,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                    ...(sessionToken && { sessionToken })
                }
            });

            console.log('🔧 Creating AWS Bedrock client...');
            console.log('🤖 Testing Amazon Nova Pro...\n');

            const command = new ConverseCommand({
                modelId: 'us.amazon.nova-pro-v1:0',
                messages: [{
                    role: 'user',
                    content: [{ text: 'Hello! Please respond with a simple greeting.' }]
                }],
                inferenceConfig: {
                    maxTokens: 100,
                    temperature: 0.7
                }
            });

            const response = await bedrockClient.send(command);

            console.log('✅ SUCCESS! AWS Bedrock is working!\n');
            console.log(`📝 Response: ${response.output.message.content[0].text}\n`);
            console.log(`🎯 Tokens Used: ${response.usage.inputTokens + response.usage.outputTokens}`);
            console.log(`⏱️  Stop Reason: ${response.stopReason}\n`);

            console.log('═══════════════════════════════════════');
            console.log('✅ AWS BEDROCK CONNECTION TEST PASSED');
            console.log('═══════════════════════════════════════');
            console.log('Amazon Nova Pro is accessible and working!\n');

            process.exit(0);

        } catch (error) {
            const isExpiredToken =
                error.name === 'ExpiredTokenException' ||
                error.message?.includes('expired') ||
                error.message?.includes('security token');

            if (isExpiredToken && retryCount === 0) {
                // Automatically refresh tokens WITHOUT asking
                const refreshed = await refreshTokens();

                if (refreshed) {
                    // Reload credentials from updated .env
                    accessKeyId = process.env.aws_access_key_id;
                    secretAccessKey = process.env.aws_secret_access_key;
                    sessionToken = process.env.aws_session_token;

                    console.log('🔄 Retrying connection with fresh credentials...\n');
                    return attemptConnection(1); // Retry once
                } else {
                    console.log('\n💡 Please run manually: python refToken.py\n');
                    process.exit(1);
                }

            } else {
                console.error('\n═══════════════════════════════════════');
                console.error('❌ AWS BEDROCK CONNECTION FAILED');
                console.error('═══════════════════════════════════════');
                console.error(`Error: ${error.name}`);
                console.error(`Message: ${error.message}\n`);

                if (error.name === 'AccessDeniedException') {
                    console.error('⚠️  Permission Issue:');
                    console.error('Your AWS account may not have Bedrock API access.');
                    console.error('Contact your AWS administrator for permissions.\n');
                }

                process.exit(1);
            }
        }
    };

    await attemptConnection();
};

testAWSConnection();
