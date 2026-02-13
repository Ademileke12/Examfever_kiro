# Grade: D
## Summary of Findings
The provided codebase has several critical security vulnerabilities and potential issues. 

### Critical Issues
1. **Insecure Direct Object Reference (IDOR)**: The `affiliate.stats` route is vulnerable to IDOR attacks, as it uses the authenticated user's ID to fetch stats, but an attacker can modify the `user_id` parameter to access other users' stats.
2. **Payment Amount Manipulation**: The `subscription.verify` route is vulnerable to payment amount manipulation attacks, as an attacker can modify the `amount` parameter to pay a lower amount.
3. **Lack of Input Validation**: The `subscription.verify` route does not validate the `reference` and `type` parameters, which can lead to security vulnerabilities.
4. **Hardcoded Secrets**: The `PAYSTACK_SECRET_KEY` is hardcoded in the code, which is a security risk.
5. **Insecure Error Handling**: The code does not handle errors securely, as it returns detailed error messages that can reveal sensitive information.

### Improvements
1. **Implement Robust Input Validation**: Validate all input parameters to prevent security vulnerabilities.
2. **Use Secure Error Handling**: Implement secure error handling mechanisms to prevent detailed error messages from being returned.
3. **Remove Hardcoded Secrets**: Remove hardcoded secrets and use environment variables or a secure secrets management system.
4. **Implement IDOR Protections**: Implement IDOR protections to prevent unauthorized access to sensitive data.
5. **Use Secure Payment Processing**: Use secure payment processing mechanisms to prevent payment amount manipulation attacks.

### Recommended Fixes
```javascript
// Fix 1: Implement IDOR protections for affiliate.stats route
const affiliateStatsRoute = async (req) => {
    const userId = req.auth.getUser().id;
    const stats = await supabase.from('affiliate_profiles').select('referral_code, total_balance, referred_count').eq('user_id', userId).single();
    return stats;
}

// Fix 2: Validate input parameters for subscription.verify route
const verifySubscriptionRoute = async (req) => {
    const reference = req.body.reference;
    const type = req.body.type;
    if (!reference || !type) {
        return { error: 'Invalid request' };
    }
    // Proceed with verification
}

// Fix 3: Remove hardcoded secrets and use environment variables
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

// Fix 4: Implement secure error handling
const handleError = (error) => {
    return { error: 'An error occurred' };
}

// Fix 5: Implement secure payment processing
const verifyPayment = async (req) => {
    const amount = req.body.amount;
    if (amount < 0) {
        return { error: 'Invalid payment amount' };
    }
    // Proceed with payment verification
}
```

---BEGIN DITO TESTS---
```javascript
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Test 1: Test affiliate.stats route for IDOR vulnerability
fetch(`${BASE_URL}/api/affiliate/stats?user_id=attacker-id`, {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer valid-token'
    }
})
.then((res) => {
    if (res.status === 401) {
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
    if (res.status === 400) {
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
    if (res.status === 400) {
        console.log("PASS: Input validation is implemented");
    } else {
        console.log("FAIL: Input validation is not implemented");
    }
});
```
---END DITO TESTS---