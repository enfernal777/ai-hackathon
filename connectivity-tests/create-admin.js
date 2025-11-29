
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createAdmin() {
    console.log('Creating new admin user...');

    const username = 'newadmin';
    const password = 'password123';
    const name = 'New Admin User';

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Check if user exists
    const { data: existing } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

    if (existing) {
        console.log('Admin user already exists. Updating password...');
        const { error } = await supabase
            .from('admins')
            .update({ password_hash })
            .eq('username', username);

        if (error) {
            console.error('Error updating admin:', error);
        } else {
            console.log('✅ Admin password updated successfully');
        }
    } else {
        console.log('Creating new admin...');
        const { error } = await supabase
            .from('admins')
            .insert({
                username,
                password_hash,
                name
            });

        if (error) {
            console.error('Error creating admin:', error);
        } else {
            console.log('✅ Admin created successfully');
        }
    }
}

createAdmin();
