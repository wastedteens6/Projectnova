import axios from 'axios';

async function testUpdateRoute() {
  try {
    const token = 'your_admin_token_here'; // Get a real token
    
    const response = await axios({
      method: 'put',
      url: 'http://localhost:5000/api/admin/projects/acb1a623-1b97-49a7-b027-61f7eeef8205',
      data: {
        title: 'Updated Title',
        description: 'Updated description',
        category: 'Web',
        tier1Price: '599',
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ PUT route works!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testUpdateRoute();
