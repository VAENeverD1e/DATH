// Minimal server/test script that verifies connection to Supabase
require('dotenv').config();
const supabase = require('./supabaseClient');

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    // Attempt a lightweight query. Use your Users table (adjust if different).
    const tableToTest = process.env.TEST_TABLE || 'Users';
    const { data, error } = await supabase.from(tableToTest).select('*').limit(1);
    if (error) {
      console.error('Supabase test query failed:', error.message || error);
      process.exitCode = 1;
      return;
    }
    console.log(`Supabase connected — sample query on table "${tableToTest}" returned:`, data);
  } catch (err) {
    console.error('Unexpected error while testing Supabase connection:', err.message || err);
    process.exitCode = 1;
  }
}

testConnection();
