
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

console.log('Checking admins table schema...\n');

// Get the table structure by querying metadata (limit 0)
const { data: structure, error: structureError } = await supabase
    .from('admins')
    .select('*')
    .limit(0);

if (structureError) {
    console.error('❌ Error checking structure:', structureError);
} else {
    console.log('✅ Admins table accessible');
}

// Check the specific user 'newadmin'
console.log('\nChecking user "newadmin"...');
const { data: user, error: userError } = await supabase
    .from('admins')
    .select('*')
    .eq('username', 'newadmin')
    .single();

if (userError) {
    console.error('❌ Error fetching user:', userError);
} else {
    console.log('✅ User found:', user);
    console.log('   Keys:', Object.keys(user));
    console.log('   password_hash type:', typeof user.password_hash);
    console.log('   password_hash value:', user.password_hash ? user.password_hash.substring(0, 10) + '...' : 'NULL');
}
