require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Requires service role key (NOT anon) because Administrator table likely protected by RLS.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ensureAdministratorRecord() {
  try {
    // Find the admin user by role=admin (first one)
    const { data: adminUsers, error: userErr } = await supabase
      .from('Users')
      .select('id, username, role')
      .eq('role', 'admin')
      .limit(1);
    if (userErr) throw userErr;
    if (!adminUsers || !adminUsers.length) {
      console.error('No admin user found in Users table. Create one first with createAdmin.js');
      return;
    }
    const adminUser = adminUsers[0];
    const admin_id = adminUser.id; // Align admin_id with Users.id for simplicity

    // Check existing Administrator record
    const { data: existingAdmin, error: adminCheckErr } = await supabase
      .from('Administrator')
      .select('admin_id, user_id')
      .eq('admin_id', admin_id)
      .limit(1);
    if (adminCheckErr) throw adminCheckErr;
    if (existingAdmin && existingAdmin.length) {
      console.log(`Administrator record already exists for admin_id=${admin_id}`);
      return;
    }

    // Insert new Administrator record (admin_id=user_id pattern)
    const { data: insertRows, error: insertErr } = await supabase
      .from('Administrator')
      .insert([{ admin_id, user_id: adminUser.id }])
      .select('admin_id, user_id');
    if (insertErr) throw insertErr;
    console.log('Administrator record created:', insertRows);
  } catch (err) {
    console.error('Failed to init Administrator record:', err.message || err);
    process.exitCode = 1;
  }
}

ensureAdministratorRecord();