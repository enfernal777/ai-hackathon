import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TextractClient, StartDocumentTextDetectionCommand, GetDocumentTextDetectionCommand } from '@aws-sdk/client-textract';
import { ComprehendClient, DetectKeyPhrasesCommand, DetectEntitiesCommand } from '@aws-sdk/client-comprehend';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const region = process.env.AWS_S3_REGION || 'us-east-1';
const s3Client = new S3Client({ region });
const textractClient = new TextractClient({ region: process.env.AWS_REGION });
const comprehendClient = new ComprehendClient({ region: process.env.AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export const generateUploadUrl = async (bucket: string, key: string, contentType: string) => {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const readTextFile = async (bucket: string, key: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    const response = await s3Client.send(command);
    return await response.Body?.transformToString() || '';
};

// Helper function: Extract text using AWS Textract
const extractWithTextract = async (bucket: string, key: string): Promise<string> => {
    const startCommand = new StartDocumentTextDetectionCommand({
        DocumentLocation: {
            S3Object: {
                Bucket: bucket,
                Name: key
            }
        }
    });

    const startResponse = await textractClient.send(startCommand);
    const jobId = startResponse.JobId;

    if (!jobId) {
        throw new Error('Failed to start Textract job');
    }

    let jobStatus = 'IN_PROGRESS';
    let pagesText: string[] = [];

    while (jobStatus === 'IN_PROGRESS') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const getCommand = new GetDocumentTextDetectionCommand({ JobId: jobId });
        const getResponse = await textractClient.send(getCommand);
        jobStatus = getResponse.JobStatus || 'FAILED';

        if (jobStatus === 'SUCCEEDED' && getResponse.Blocks) {
            const pageText = getResponse.Blocks
                .filter((b) => b.BlockType === 'LINE' && b.Text)
                .map((b) => b.Text)
                .join('\n');
            pagesText.push(pageText);
        }
    }

    if (jobStatus !== 'SUCCEEDED') {
        throw new Error(`Textract job failed with status: ${jobStatus}`);
    }

    return pagesText.join('\n');
};

// Helper function: Extract text using pdf-parse (local fallback)
const extractWithPdfParse = async (bucket: string, key: string): Promise<string> => {
    // Download the PDF from S3
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    const response = await s3Client.send(command);

    if (!response.Body) {
        throw new Error('Failed to download PDF from S3');
    }

    // Convert stream to Uint8Array
    const byteArray = await response.Body.transformToByteArray();
    const uint8Array = new Uint8Array(byteArray);

    // Extract text using pdf-parse
    // pdf-parse v2.4.5 exports PDFParse as a class
    const pdfModule = await import('pdf-parse');
    const pdf = pdfModule.default || pdfModule;

    // Create parser instance and extract text
    const parser = new (pdf as any).PDFParse(uint8Array);
    const result = await parser.getText();

    // Result should be a TextResult object with text property
    return result.text || result;
};

// Main extraction function with Textract-first fallback strategy
export const extractTextFromPdf = async (bucket: string, key: string): Promise<string> => {
    // Try Textract first (better OCR, handles scanned PDFs)
    try {
        console.log(`Attempting Textract extraction for ${key}...`);
        const text = await extractWithTextract(bucket, key);
        console.log(`✓ Textract extraction successful for ${key}`);
        return text;
    } catch (textractError: any) {
        // Log Textract failure and fall back to pdf-parse
        console.warn(`Textract extraction failed for ${key}: ${textractError.message}`);
        console.log(`Falling back to pdf-parse for ${key}...`);

        try {
            const text = await extractWithPdfParse(bucket, key);
            console.log(`✓ pdf-parse extraction successful for ${key}`);
            return text;
        } catch (pdfParseError: any) {
            // Both methods failed
            console.error(`Both Textract and pdf-parse failed for ${key}`);
            throw new Error(`Failed to extract text from PDF: Textract error: ${textractError.message}, pdf-parse error: ${pdfParseError.message}`);
        }
    }
};

export const analyzeText = async (text: string) => {
    // Truncate text to 5000 bytes (Comprehend limit for single batch item is 5000 bytes)
    // For simplicity, we just take the first 4500 characters
    const truncatedText = text.substring(0, 4500);

    const keyPhrasesCommand = new DetectKeyPhrasesCommand({
        Text: truncatedText,
        LanguageCode: 'en'
    });
    const entitiesCommand = new DetectEntitiesCommand({
        Text: truncatedText,
        LanguageCode: 'en'
    });

    const [keyPhrasesResponse, entitiesResponse] = await Promise.all([
        comprehendClient.send(keyPhrasesCommand),
        comprehendClient.send(entitiesCommand)
    ]);

    return {
        keyPhrases: keyPhrasesResponse.KeyPhrases,
        entities: entitiesResponse.Entities
    };
};

export const generateScenarioFromText = async (text: string) => {
    const prompt = `
    You are an expert training content analyzer.
    
    Training Material:
    ${text.substring(0, 10000)} ... (truncated)

    Task:
    1. Analyze the text and provide a concise "Context" or summary of the material (2-3 sentences).
    2. Identify the "Module Name" (e.g., "Cybersecurity Basics", "Phishing Awareness").
    3. Generate a 3x3 Rubric (9 criteria total) for evaluating understanding of this material:
       - 3 "Generic" criteria (e.g., Clarity, Accuracy, Critical Thinking).
       - 3 "Department" criteria (relevant to the general domain, e.g., Risk Assessment, Policy Adherence).
       - 3 "Module" criteria (specific to this content).

    Generate a JSON response with the following structure:
    {
        "title": "Module Name",
        "scenario_text": "The Context/Summary of the material...",
        "task": "Review the training material and answer the assessment questions.",
        "difficulty": "Normal",
        "category": "Module Name",
        "rubric": {
            "generic": ["criterion 1", "criterion 2", "criterion 3"],
            "department": ["criterion 1", "criterion 2", "criterion 3"],
            "module": ["criterion 1", "criterion 2", "criterion 3"]
        },
        "hint": "Focus on the key concepts."
    }
    
    IMPORTANT: 
    1. "rubric" must contain exactly 3 keys: "generic", "department", "module".
    2. Each key in "rubric" must be an array of exactly 3 strings.
    3. Return ONLY the valid JSON object.
    `;

    const modelId = "amazon.titan-text-express-v1";

    const command = new ConverseCommand({
        modelId,
        messages: [{
            role: "user",
            content: [{ text: prompt }]
        }],
        inferenceConfig: {
            maxTokens: 2000,
            temperature: 0,
        }
    });

    const response = await bedrockClient.send(command);

    try {
        const content = response.output?.message?.content?.[0]?.text || "{}";
        console.log("DEBUG: Raw AI Response:", content);

        // Find the first '{' and the last '}'
        const firstOpen = content.indexOf('{');
        const lastClose = content.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonString = content.substring(firstOpen, lastClose + 1);
            return JSON.parse(jsonString);
        } else {
            // Fallback to cleaning markdown if braces not found (unlikely for valid JSON)
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanContent);
        }
    } catch (e) {
        console.error("Failed to parse AI response", e);
        const content = response.output?.message?.content?.[0]?.text || "{}";
        throw new Error(`Failed to generate scenario from AI response. Content: ${content.substring(0, 200)}... Error: ${(e as any).message}`);
    }
};

// --- Employee Flow AI Functions ---

export const generateAdaptiveQuestion = async (contextText: string, history: { question: string, answer: string }[]) => {
    const historyText = history.length > 0
        ? history.map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`).join('\n\n')
        : "No previous interaction.";

    const prompt = `
    You are a helpful mentor.
    
    Context:
    ${contextText.substring(0, 5000)} ...

    History:
    ${historyText}

    Task:
    Ask the user a single interesting question about the Context to start a discussion.
    - If History is empty, ask a general question.
    - If History exists, ask a follow-up question.
    
    IMPORTANT: Return ONLY the question text.
    `;

    const command = new ConverseCommand({
        modelId: "amazon.titan-text-express-v1",
        messages: [{ role: "user", content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 500, temperature: 0.7 }
    });

    const response = await bedrockClient.send(command);
    let text = response.output?.message?.content?.[0]?.text || "Error generating question.";

    // Aggressive cleaning
    // Look for "Question:", "Here is the question:", "The question is:", or "[Question]"
    const match = text.match(/(?:Question:|Here is the question:|The question is:|\[Question\])\s*(.*)/is);
    if (match && match[1]) {
        text = match[1].trim();
    }
    // Remove any trailing "Answer:" or similar if AI generates it
    text = text.split(/Answer:/i)[0].trim();

    return text;
};

export const generatePostAssessmentQuestions = async (contextText: string) => {
    const prompt = `
    You are a trivia generator.
    
    Text:
    ${contextText.substring(0, 8000)} ...

    Task:
    Generate 5 trivia questions based on the Text.
    - Mix of multiple choice and short answer.
    
    Return a JSON array of objects.
    Example:
    [
        { "id": 1, "question": "Question?", "type": "multiple_choice", "options": ["A", "B", "C", "D"] },
        { "id": 2, "question": "Question?", "type": "short_answer" }
    ]
    
    IMPORTANT: Return ONLY the valid JSON array.
    `;

    const command = new ConverseCommand({
        modelId: "amazon.titan-text-express-v1",
        messages: [{ role: "user", content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 2000, temperature: 0 }
    });

    const response = await bedrockClient.send(command);
    const content = response.output?.message?.content?.[0]?.text || "[]";

    try {
        const firstOpen = content.indexOf('[');
        const lastClose = content.lastIndexOf(']');
        if (firstOpen !== -1 && lastClose !== -1) {
            return JSON.parse(content.substring(firstOpen, lastClose + 1));
        }

        const lines = content.split('\n');
        const questions = [];
        let currentQ = null;

        for (const line of lines) {
            const qMatch = line.match(/^\s*\d+\.\s*(.*)/);
            if (qMatch) {
                if (currentQ) questions.push(currentQ);
                currentQ = { id: questions.length + 1, question: qMatch[1].trim(), type: "short_answer" };
            } else if (currentQ) {
                // currentQ.question += " " + line.trim();
            }
        }
        if (currentQ) questions.push(currentQ);

        if (questions.length > 0) return questions;

        return JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
        console.error("Failed to parse Post-Assessment questions. Raw content:", content);
        return [];
    }
};

export const evaluateAssessment = async (
    questions: { question: string, answer: string }[],
    rubrics: { generic: string[], department: string[], module: string[] }
) => {
    const qaText = questions.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`).join('\n\n');
    const rubricsText = JSON.stringify(rubrics, null, 2);

    const prompt = `
    You are an expert grader. Evaluate the following student answers based on the provided rubrics.

    Rubrics (9 Criteria):
    ${rubricsText}

    Student Q&A:
    ${qaText}

    Task:
    1. Evaluate the answers against the 3 Generic, 3 Department, and 3 Module criteria.
    2. Provide a score (0-10) for each of the 9 criteria.
    3. Provide a brief feedback for each category.
    4. Calculate a final total score (0-100).

    Return JSON:
    {
        "scores": {
            "generic": [8, 9, 7],
            "department": [7, 8, 8],
            "module": [9, 9, 10]
        },
        "feedback": {
            "generic": "...",
            "department": "...",
            "module": "..."
        },
        "total_score": 85
    }
    
    IMPORTANT: Return ONLY the valid JSON object. Do NOT include markdown formatting.
    `;

    const command = new ConverseCommand({
        modelId: "amazon.titan-text-express-v1",
        messages: [{ role: "user", content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 1500, temperature: 0 }
    });

    const response = await bedrockClient.send(command);
    const content = response.output?.message?.content?.[0]?.text || "{}";

    try {
        const firstOpen = content.indexOf('{');
        const lastClose = content.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            return JSON.parse(content.substring(firstOpen, lastClose + 1));
        }
        return JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
        console.error("Failed to parse Evaluation", e);
        return { total_score: 0, feedback: "Error parsing evaluation." };
    }
};
