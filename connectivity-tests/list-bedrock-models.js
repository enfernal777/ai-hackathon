/**
 * List Available AWS Bedrock Models
 * This script queries AWS Bedrock to list all available foundation models
 * and saves the results to bedrockmodel.md
 */

import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import { fromIni } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const listBedrockModels = async () => {
    console.log('🔍 Fetching AWS Bedrock Models...\n');

    const regionName = process.env.region_name;
    const profileName = process.env.profile_name;
    const accessKeyId = process.env.aws_access_key_id;
    const secretAccessKey = process.env.aws_secret_access_key;
    const sessionToken = process.env.aws_session_token;

    if (!regionName) {
        console.error('❌ Missing region_name in .env file\n');
        process.exit(1);
    }

    let credentials;
    if (accessKeyId && secretAccessKey) {
        credentials = {
            accessKeyId,
            secretAccessKey,
            ...(sessionToken && { sessionToken })
        };
        console.log('✓ Using direct credentials');
    } else if (profileName) {
        credentials = fromIni({ profile: profileName });
        console.log(`✓ Using AWS profile: ${profileName}`);
    } else {
        console.error('❌ No AWS credentials found in .env\n');
        process.exit(1);
    }

    console.log(`✓ Region: ${regionName}\n`);

    try {
        const client = new BedrockClient({
            region: regionName,
            credentials: credentials
        });

        const command = new ListFoundationModelsCommand({});
        const response = await client.send(command);

        const models = response.modelSummaries || [];
        console.log(`✅ Found ${models.length} foundation models\n`);

        // Group models by provider
        const modelsByProvider = {};
        models.forEach(model => {
            const provider = model.providerName || 'Unknown';
            if (!modelsByProvider[provider]) {
                modelsByProvider[provider] = [];
            }
            modelsByProvider[provider].push(model);
        });

        // Generate markdown content
        let markdown = `# AWS Bedrock Available Models\n\n`;
        markdown += `**Region**: ${regionName}  \n`;
        markdown += `**Last Updated**: ${new Date().toISOString()}  \n`;
        markdown += `**Total Models**: ${models.length}\n\n`;
        markdown += `---\n\n`;

        // Add models by provider
        Object.keys(modelsByProvider).sort().forEach(provider => {
            markdown += `## ${provider}\n\n`;

            modelsByProvider[provider].forEach(model => {
                markdown += `### ${model.modelName}\n\n`;
                markdown += `- **Model ID**: \`${model.modelId}\`\n`;
                markdown += `- **Input Modalities**: ${model.inputModalities?.join(', ') || 'N/A'}\n`;
                markdown += `- **Output Modalities**: ${model.outputModalities?.join(', ') || 'N/A'}\n`;
                if (model.responseStreamingSupported) {
                    markdown += `- **Streaming**: ✅ Supported\n`;
                }
                if (model.customizationsSupported && model.customizationsSupported.length > 0) {
                    markdown += `- **Customization**: ${model.customizationsSupported.join(', ')}\n`;
                }
                if (model.inferenceTypesSupported && model.inferenceTypesSupported.length > 0) {
                    markdown += `- **Inference Types**: ${model.inferenceTypesSupported.join(', ')}\n`;
                }
                markdown += `\n`;
            });
        });

        markdown += `---\n\n`;
        markdown += `## Usage Example\n\n`;
        markdown += `To test a model, update \`connectivity-tests/test-aws.js\` with the desired model ID:\n\n`;
        markdown += `\`\`\`javascript\n`;
        markdown += `const command = new ConverseCommand({\n`;
        markdown += `  modelId: 'your-model-id-here',  // Replace with model ID from above\n`;
        markdown += `  // ... rest of configuration\n`;
        markdown += `});\n`;
        markdown += `\`\`\`\n\n`;
        markdown += `Then run: \`npm run test:aws\`\n`;

        // Write to file
        const outputPath = join(__dirname, '..', 'bedrockmodel.md');
        writeFileSync(outputPath, markdown, 'utf8');

        console.log(`✅ Models list saved to: bedrockmodel.md\n`);
        console.log(`📊 Summary:`);
        Object.keys(modelsByProvider).sort().forEach(provider => {
            console.log(`   ${provider}: ${modelsByProvider[provider].length} models`);
        });
        console.log();

        process.exit(0);

    } catch (error) {
        console.error('❌ Failed to list models\n');
        console.error(`Error: ${error.name}`);
        console.error(`Message: ${error.message}\n`);

        if (error.name === 'ExpiredTokenException') {
            console.error('Your AWS session token has expired.');
            console.error('Please update your credentials in .env file.\n');
        } else if (error.name === 'UnrecognizedClientException') {
            console.error('Invalid AWS credentials.');
            console.error('Please check your .env file.\n');
        } else if (error.name === 'AccessDeniedException') {
            console.error('You don\'t have permission to list Bedrock models.');
            console.error('Required permission: bedrock:ListFoundationModels\n');
        }

        process.exit(1);
    }
};

listBedrockModels();
