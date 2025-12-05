import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { generateUploadUrl, extractTextFromPdf, readTextFile, generateScenarioFromText } from '../services/awsService';

export const getUploadUrl = async (req: Request, res: Response) => {
    try {
        const { fileName, contentType, userId } = req.body;

        if (!fileName || !contentType || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const key = `uploads/${userId}/${Date.now()}-${fileName}`;
        const uploadUrl = await generateUploadUrl(process.env.AWS_S3_BUCKET_NAME || 'ai-hackathon-uploads', key, contentType);

        res.json({
            uploadUrl,
            key
        });
    } catch (error: any) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({ message: 'Failed to generate upload URL', error: error.message });
    }
};

export const processFile = async (req: Request, res: Response) => {
    try {
        console.log('DEBUG: processFile called with body:', JSON.stringify(req.body));
        const { key, userId, departmentId, postAssessmentDate } = req.body;

        if (!key || !userId || !departmentId || !postAssessmentDate) {
            return res.status(400).json({ message: 'Missing required fields: key, userId, departmentId, postAssessmentDate' });
        }

        const bucket = process.env.AWS_S3_BUCKET_NAME || 'ai-hackathon-uploads';
        let text = '';

        // Determine file type and extract text accordingly
        if (key.endsWith('.pdf')) {
            text = await extractTextFromPdf(bucket, key);
        } else {
            // Assume text file
            text = await readTextFile(bucket, key);
        }

        // Fetch department name for context
        const { data: deptData, error: deptError } = await supabase
            .from('departments')
            .select('name')
            .eq('id', departmentId)
            .single();

        const departmentName = deptData?.name || 'General';

        // 2. Generate scenario using Bedrock
        // Append department context to text
        const contextText = `Department: ${departmentName}\n\n${text}`;
        const generatedScenario = await generateScenarioFromText(contextText);

        // 3. Save to Supabase as draft
        const insertData = {
            title: generatedScenario.title,
            scenario_text: generatedScenario.scenario_text,
            task: generatedScenario.task,
            difficulty: generatedScenario.difficulty,
            rubric: generatedScenario.rubric, // Now contains generic, department, module keys
            hint: generatedScenario.hint,
            creator_id: userId,
            source_file: key,
            status: 'draft',
            type: 'text',
            category: generatedScenario.category || 'Training',
            skill: 'General',
            department_id: departmentId,
            post_assessment_date: postAssessmentDate
        };
        console.log('DEBUG: Inserting into scenarios:', JSON.stringify(insertData, null, 2));

        const { data, error } = await supabase
            .from('scenarios')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            message: 'File processed and scenario created successfully',
            scenario: data
        });

    } catch (error: any) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Failed to process file', error: error.message });
    }
};

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
    }
};
