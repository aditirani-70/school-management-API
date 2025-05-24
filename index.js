const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();  // app ko sabse pehle declare karo

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Raniaditi9554@#', // apna password yahan dalein
  database: 'school_management'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Distance calculation function
function getDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Default route
app.get('/', (req, res) => {
  res.send('School Management API is running');
});

// Add a school
app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      console.error('Error inserting school:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'School added successfully', schoolId: result.insertId });
  });
});

// List schools sorted by distance
app.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  const sql = 'SELECT * FROM schools';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching schools:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    results.forEach(school => {
      school.distance = getDistance(userLat, userLon, school.latitude, school.longitude);
    });

    results.sort((a, b) => a.distance - b.distance);

    res.json(results);
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});