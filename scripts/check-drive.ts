import { grantDriveAccess } from './src/lib/google-drive';

/**
 * Basic test script to verify Google Drive credentials
 * Run with: npx ts-node check-drive.ts
 */
async function testDrive() {
  const testFileId = '1_dummy_drive_id_tier1'; // Replace with a real ID for true testing
  const testEmail = 'rohit@example.com'; 

  console.log('🧪 Testing Google Drive Permission Grant...');
  console.log(`Target Email: ${testEmail}`);
  console.log(`Target File ID: ${testFileId}`);

  try {
    const result = await grantDriveAccess(testFileId, testEmail);
    if (result) {
      console.log('✅ Success! Permission granted (simulated or real).');
      console.log('Permission Data:', JSON.stringify(result, null, 2));
    } else {
      console.log('⚠️ Credentials missing. Running in simulation mode.');
    }
  } catch (error) {
    console.error('❌ Drive Test Failed:', error);
    process.exit(1);
  }
}

testDrive();
