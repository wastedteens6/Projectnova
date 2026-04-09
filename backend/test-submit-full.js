import fetch from 'node-fetch';

async function run() {
  try {
    const payload = {
      userEmail: "test2@test.com",
      projectName: "Test Proj",
      description: "test desc",
      technologies: "react",
      domain: "Web Development",
      inputOutput: "input/output",
      deliverables: ["source"],
      expectedDeadline: "2026-05-05",
      phone: "1234567890",
      budget: "100"
    };

    const response = await fetch('http://localhost:5000/api/custom-projects/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('STATUS:', response.status);
    const text = await response.text();
    console.log('BODY:', text);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

run();
