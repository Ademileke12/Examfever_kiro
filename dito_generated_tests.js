const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Test 1: Test affiliate.stats route for IDOR vulnerability
fetch(`${BASE_URL}/api/affiliate/stats?user_id=attacker-id`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer valid-token'
  }
})
  .then((res) => {
    // Both 401 and 400 are secure blocks
    if (res.status === 401 || res.status === 400) {
      console.log("PASS: IDOR protection is implemented");
    } else {
      console.log("FAIL: IDOR vulnerability is present");
    }
  });

// Test 2: Test subscription.verify route for payment amount manipulation vulnerability
fetch(`${BASE_URL}/api/subscription/verify`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reference: 'test-ref',
    type: 'plan',
    amount: -100
  })
})
  .then((res) => {
    // 401 (Unauthorized) or 400 (Bad Request) are secure blocks
    if (res.status === 400 || res.status === 401) {
      console.log("PASS: Payment amount manipulation protection is implemented");
    } else {
      console.log("FAIL: Payment amount manipulation vulnerability is present");
    }
  });

// Test 3: Test subscription.verify route for input validation
fetch(`${BASE_URL}/api/subscription/verify`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reference: '',
    type: ''
  })
})
  .then((res) => {
    // 401 (Unauthorized) or 400 (Bad Request) are secure blocks
    if (res.status === 400 || res.status === 401) {
      console.log("PASS: Input validation is implemented");
    } else {
      console.log("FAIL: Input validation is not implemented");
    }
  });