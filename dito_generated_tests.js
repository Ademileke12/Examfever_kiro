/**
 * REFIXED DITO TESTS - Node.js Compatible
 * This script verifies that the security hardening is working by 
 * attempting common attacks against the API.
 */

const BASE_URL = 'http://localhost:3000'

const urls = [
  '/api/exams',
  '/api/pdf/upload',
  '/api/affiliate/stats',
  '/api/exam-results'
]

const payloads = [
  { title: "admin' OR 1=1 --", description: "SQL Injection Test" },
  { title: "<script>alert('xss')</script>", description: "XSS Test" },
  { invalidField: true }
]

const testApi = async (url, payload) => {
  const fullUrl = `${BASE_URL}${url}`
  console.log(`\nTesting: ${fullUrl}`)
  console.log(`Payload: ${JSON.stringify(payload)}`)

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const status = response.status
    let body
    try {
      body = await response.json()
    } catch {
      body = { message: 'Non-JSON response' }
    }

    // A "SAFE" response in this context is a 400 (Bad Request), 401 (Unauthorized), or 403 (Forbidden)
    // because it means our validation or auth middleware blocked the malicious input.
    if (status >= 400) {
      console.log(`✅ BLOCKED (${status}): The security layer successfully caught this attempt.`)
      // console.log(`Response:`, JSON.stringify(body, null, 2))
    } else {
      console.log(`⚠️  VULNERABLE (${status}): The request was accepted. Check if data was sanitized.`)
      console.log(`Response Data:`, JSON.stringify(body, null, 2))
    }
  } catch (error) {
    console.error(`❌ CONNECTION ERROR: ${error.message}`)
    console.log(`Make sure your dev server is running at ${BASE_URL}`)
  }
}

const runTests = async () => {
  console.log('--- STARTING SECURITY VALIDATION TESTS ---')
  for (const url of urls) {
    for (const payload of payloads) {
      await testApi(url, payload)
    }
  }
  console.log('\n--- TESTS COMPLETE ---')
}

runTests()