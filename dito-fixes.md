# 🛠️ Dito Fix Prompts

Use these prompts with any AI (ChatGPT, DeepSeek, Claude) to fix the issues found in your code.

---

## Fix #1: Insecure Direct Object Reference (IDOR)

**Issue**: The `affiliate.stats` route is vulnerable to IDOR attacks, as it uses the authenticated user's ID to fetch stats, but an attacker can modify the `user_id` parameter to access other users' stats.

### 📋 Copy & Paste Prompt:
```
Act as a Senior Security Engineer. I have a code issue in my project.

ISSUE: Insecure Direct Object Reference (IDOR) - The `affiliate.stats` route is vulnerable to IDOR attacks, as it uses the authenticated user's ID to fetch stats, but an attacker can modify the `user_id` parameter to access other users' stats.

TASK: Analyze the relevant files in my project and rewrite the code to fix this issue according to industry best practices. Ensure the fix is secure and efficient.
```

---



## Fix #4: Hardcoded Secrets

**Issue**: The `PAYSTACK_SECRET_KEY` is hardcoded in the code, which is a security risk.

### 📋 Copy & Paste Prompt:
```
Act as a Senior Security Engineer. I have a code issue in my project.

ISSUE: Hardcoded Secrets - The `PAYSTACK_SECRET_KEY` is hardcoded in the code, which is a security risk.

TASK: Analyze the relevant files in my project and rewrite the code to fix this issue according to industry best practices. Ensure the fix is secure and efficient.
```

---

## Fix #5: Insecure Error Handling

**Issue**: The code does not handle errors securely, as it returns detailed error messages that can reveal sensitive information.

### 📋 Copy & Paste Prompt:
```
Act as a Senior Security Engineer. I have a code issue in my project.

ISSUE: Insecure Error Handling - The code does not handle errors securely, as it returns detailed error messages that can reveal sensitive information.

TASK: Analyze the relevant files in my project and rewrite the code to fix this issue according to industry best practices. Ensure the fix is secure and efficient.
```

---

## Fix #2: Payment Amount Manipulation

**Issue**: The `subscription.verify` route is vulnerable to payment amount manipulation attacks, as an attacker can modify the `amount` parameter to pay a lower amount.

### 📋 Copy & Paste Prompt:
```
Act as a Senior Security Engineer. I have a code issue in my project.

ISSUE: Payment Amount Manipulation - The `subscription.verify` route is vulnerable to payment amount manipulation attacks, as an attacker can modify the `amount` parameter to pay a lower amount.

TASK: Analyze the relevant files in my project and rewrite the code to fix this issue according to industry best practices. Ensure the fix is secure and efficient.
```

---

## Fix #3: Lack of Input Validation

**Issue**: The `subscription.verify` route does not validate the `reference` and `type` parameters, which can lead to security vulnerabilities.

### 📋 Copy & Paste Prompt:
```
Act as a Senior Security Engineer. I have a code issue in my project.

ISSUE: Lack of Input Validation - The `subscription.verify` route does not validate the `reference` and `type` parameters, which can lead to security vulnerabilities.

TASK: Analyze the relevant files in my project and rewrite the code to fix this issue according to industry best practices. Ensure the fix is secure and efficient.
```

---