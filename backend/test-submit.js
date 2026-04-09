fetch('http://localhost:5000/api/custom-projects/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userEmail: "test@test.com",
    projectName: "Test",
    description: "test",
    technologies: "react",
    domain: "Web",
    inputOutput: "test",
    deliverables: ["source"],
    expectedDeadline: "2026-05-05",
    phone: "123",
    budget: "100"
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(e => console.error(e));
