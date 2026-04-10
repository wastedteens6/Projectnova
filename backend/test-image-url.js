// Quick test to verify images can be served from backend
import axios from "axios";

async function testImageServing() {
  const testUrls = [
    "http://localhost:5000/uploads/projects/images/projectImages-1775721327570-361204440.png",
    "http://localhost:5000/api/health",
  ];

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.head(url, { timeout: 5000 });
      console.log(`✅ SUCCESS: ${response.status}`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.code || error.message}`);
    }
  }
}

testImageServing();
