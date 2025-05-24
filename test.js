const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.listen(3000, () => {
  console.log('Test server running on port 3000');
});