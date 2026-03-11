const { database } = require('./config/database');

async function checkTableStructure() {
  try {
    console.log('Checking table structure...');
    
    const result = await database.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position
    `);
    
    console.log('Students table columns:');
    result.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    // Also check what data is already in the table
    const existingData = await database.fetchAll('students');
    console.log(`\nExisting students: ${existingData.length}`);
    if (existingData.length > 0) {
      console.log('Sample student:', existingData[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
