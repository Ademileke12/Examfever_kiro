// Standalone test script for identifying vulnerabilities
const urls = [
  '/api/users',
  '/api/upload',
  '/api/affiliate/stats'
]

const payloads = [
  { username: 'admin\' OR 1=1' },
  { name: '<script>alert(1)</script>' },
  { file: new File(['hello world'], 'example.txt', { type: 'text/plain' }) }
]

const testApi = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    const body = await response.json()
    if (body.success) {
      console.log('Vulnerability found')
    } else {
      console.log('No vulnerability found')
    }
  } catch (error) {
    console.error(error)
  }
}

const testVulnerability = async () => {
  for (const url of urls) {
    for (const payload of payloads) {
      await testApi(url, payload)
    }
  }
}

testVulnerability()