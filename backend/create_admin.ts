import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const username = 'admin';
    const password = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Creating admin user: ${username}`);

    // Check if exists
    const { data: existing } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

    if (existing) {
        console.log('Admin already exists. Updating password...');
        const { error } = await supabase
            .from('admins')
            .update({ password_hash: hashedPassword })
            .eq('id', existing.id);

        if (error) console.error('Error updating:', error);
        else console.log('Password updated.');
    } else {
        console.log('Creating new admin...');
        const { error } = await supabase
            .from('admins')
            .insert({
                username,
                password_hash: hashedPassword,
                name: 'Admin User'
            });

        if (error) console.error('Error creating:', error);
        else console.log('Admin created.');
    }
}

createAdmin();
