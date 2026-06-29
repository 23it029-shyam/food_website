const http = require('http');

const testApi = () => {
  const data = JSON.stringify({
    email: 'admin@shyameats.com',
    password: 'admin123',
    requiredRole: 'admin'
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    console.log(`Status Code: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      console.log('Response Body:');
      console.log(responseBody);
    });
  });

  req.on('error', (err) => {
    console.error('API Test Request Error:', err.message);
  });

  req.write(data);
  req.end();
};

testApi();
