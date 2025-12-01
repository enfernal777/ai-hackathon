import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const region = process.env.AWS_REGION || 'us-east-1';
console.log(`AWS_REGION: ${region}`);
console.log(`AWS_PROFILE: ${process.env.AWS_PROFILE}`);

const client = new BedrockRuntimeClient({ region });

const modelId = "amazon.titan-text-express-v1";
const prompt = "Hello, are you working?";

async function test() {
    try {
        console.log(`Invoking model ${modelId}...`);
        const command = new ConverseCommand({
            modelId,
            messages: [{ role: "user", content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens: 100, temperature: 0.7 }
        });

        const response = await client.send(command);
        console.log("Response received:");
        console.log(response.output?.message?.content?.[0]?.text);
        console.log("SUCCESS: Bedrock is working.");
    } catch (error: any) {
        console.error("ERROR: Bedrock invocation failed.");
        console.error(error);
    }
}

test();
