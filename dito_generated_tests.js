const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test for exposed API keys and secrets
fetch(`${BASE_URL}/api/config`, {
  method: 'GET',
})
.then((res) => {
  if (res.status === 200) {
    console.log('FAIL: Exposed API keys and secrets');
  } else {
    console.log('PASS: No exposed API keys and secrets');
  }
});

// Test for authentication and authorization
fetch(`${BASE_URL}/api/questions`, {
  method: 'GET',
})
.then((res) => {
  if (res.status === 401) {
    console.log('PASS: Authentication and authorization required');
  } else {
    console.log('FAIL: Missing authentication and authorization');
  }
});

// Test for rate limiting
const fetchQuestion = async () => {
  await fetch(`${BASE_URL}/api/questions`, {
    method: 'GET',
  });
};

for (let i = 0; i < 10; i++) {
  fetchQuestion();
}

setTimeout(() => {
  fetch(`${BASE_URL}/api/questions`, {
    method: 'GET',
  })
  .then((res) => {
    if (res.status === 429) {
      console.log('PASS: Rate limiting enabled');
    } else {
      console.log('FAIL: Missing rate limiting');
    }
  });
}, 1000);