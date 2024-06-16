import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
const app = express();
const port = 5000;
// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Middleware to log request
app.use((req, res, next) => {
    const now = new Date();
    const localTime = now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    console.log(`[${localTime}.${milliseconds}] ${req.method} ${req.path}`);
    next();
});
// Serve static files from the React app
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'blog/build')));
// API routes
app.post('/api/article/list', async (req, res) => {
    try {
        const response = await fetch('http://localhost:6666/api/v1/article/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});
app.post('/api/article/get', async (req, res) => {
    try {
        const { title } = req.body; // Get the title from the request body
        const response = await fetch(`http://localhost:6666/api/v1/article/get`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});
// Mock data endpoint (replace actual fetch request)
// const mockData = [
//   { id: 1, title: 'Article 1' },
//   { id: 2, title: 'Article 2' },
//   { id: 3, title: 'Article 3' },
//   { id: 4, title: 'Article 4' }
// ];
// app.get('/api/v1/article/list', async (req: Request, res: Response) => {
//   try {
//     res.json(mockData);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).json({ error: 'Error fetching data' });
//   }
// });
// Upper code is for mock data when testing
// Route all other requests to React app's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog/build', 'index.html'));
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
