import jwt from 'jsonwebtoken';

async function run() {
  const token = jwt.sign(
    { id: '123', email: 'admin@projectnova.com', role: 'admin' },
    'your-secret-key-change-this',
    { expiresIn: '1h' }
  );

  try {
    const response = await fetch('http://localhost:5000/api/admin/custom-projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('STATUS:', response.status);
    const data = await response.text();
    console.log('BODY:', data);
  } catch (err) {
    console.error('FETCH ERROR:', err.message);
  }
}
run();
