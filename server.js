import express from 'express';
const app = express();
const port = 5000;

app.use((req, res, next) => {
  const now = new Date();
  const localTime = now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  console.log(`[${localTime}.${milliseconds}] ${req.method} ${req.path}`);
  next();
});

// Serve static files from the React
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'blog/build')));

import fetch from 'node-fetch';
app.get('/api/article/list', async (req, res) => {
  try {
    const response = await fetch('http://localhost:6666/api/v1/article/list');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});
app.get('/api/article/:id', async (req, res) => {
  try {
    const id = req.params.id; // Get the article ID from the route parameters
    const response = await fetch('http://localhost:6666/api/v1/article/' + id);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Mock data to be returned instead of making an actual fetch request
const mockData = [
  { id: 1, title: 'Article 1' },
  { id: 2, title: 'Article 2' },
  { id: 3, title: 'Article 3' },
  { id: 4, title: 'Article 4' }
];
app.get('/api/v1/article/list', async (req, res) => {
  try {
    // Simulate fetching data by returning the mock data
    res.json(mockData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});
// upper is for mock

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});