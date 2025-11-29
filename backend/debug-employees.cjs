const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debugEmployees() {
    console.log('Checking employees table...');

    const { data, error, count } = await supabase
        .from('employees')
        .select('id, name, job_title, ranking, win_rate, streak', { count: 'exact' });

    if (error) {
        console.error('Error fetching employees:', error);
    } else {
        console.log(`Found ${count} employees.`);
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

debugEmployees();
