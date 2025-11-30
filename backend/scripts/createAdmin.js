require('dotenv').config();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Ensure you have these in your .env file (SERVICE ROLE KEY is required for elevated inserts bypassing RLS policies)
// SUPABASE_URL=...
// SUPABASE_SERVICE_ROLE_KEY=...

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Define admin credentials here or pull from env vars for automation.
const ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'ChangeMeNow!123', // CHANGE THIS BEFORE RUNNING IN PROD
  phone_number: process.env.ADMIN_PHONE || '+10000000000',
  date_of_birth: process.env.ADMIN_DOB || '1990-01-01',
  address: process.env.ADMIN_ADDRESS || 'Head Office',
  gender: process.env.ADMIN_GENDER || 'Other',
  role: 'admin'
};

async function createAdmin() {
  try {
    console.log('Checking for existing admin user...');
    const { data: existing, error: existError } = await supabase
      .from('Users')
      .select('id, username, email')
      .eq('username', ADMIN.username)
      .limit(1);

    if (existError) throw existError;

    if (existing && existing.length > 0) {
      console.log(`Admin user with username "${ADMIN.username}" already exists (id=${existing[0].id}). Nothing to do.`);
      return;
    }

    console.log('Hashing password...');
    const hashed = await bcrypt.hash(ADMIN.password, 12);

    console.log('Inserting admin user...');
    const { data: inserted, error: insertError } = await supabase
      .from('Users')
      .insert([
        {
          username: ADMIN.username.trim(),
          email: ADMIN.email.trim(),
          password: hashed,
          phone_number: ADMIN.phone_number.trim(),
          date_of_birth: ADMIN.date_of_birth,
          address: ADMIN.address.trim(),
          gender: ADMIN.gender.trim(),
          role: ADMIN.role
        }
      ])
      .select('id, username, email, role');

    if (insertError) throw insertError;

    console.log('Admin user created successfully:');
    console.table(inserted);
    console.log('\nIMPORTANT: Change the default password value if you used the placeholder.');
  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exitCode = 1;
  }
}

createAdmin();
