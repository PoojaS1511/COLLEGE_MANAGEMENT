const { supabase } = require('./supabase_client');

const tables = [
  'users',
  'faculty', 
  'audits',
  'grievances',
  'policies',
  'accreditation_reports'
];

async function checkTables() {
  console.log('🔍 Checking Quality module tables...\n');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: MISSING - ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR - ${err.message}`);
    }
  }
  
  console.log('\n🏁 Table check complete!');
}

checkTables().then(() => process.exit(0)).catch(err => {
  console.error('Check failed:', err);
  process.exit(1);
});
