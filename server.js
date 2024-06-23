import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cluster from 'cluster';
import { cpus } from 'os';
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
app.get('/sitemap.txt', async (req, res) => {
    try {
        const response = await fetch('http://localhost:6666/api/v1/article/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json(); // Type assertion
        let articleTitles = data.data.map(article => `${req.protocol}://${req.get('host')}/article/` + article.title).join('\n');
        articleTitles = `${req.protocol}://${req.get('host')}/\n` + articleTitles;
        res.setHeader('Content-Type', 'text/plain');
        res.send(articleTitles);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});
app.get('/article/static/:image', async (req, res) => {
    console.log('test');
    try {
        const { image } = req.params;
        const response = await fetch('http://localhost:6666/api/v1/image/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image })
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        // Check if response body exists and is readable
        if (response.body && typeof response.body.pipe === 'function') {
            // Set content type based on image type
            res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
            // Stream image data to client response
            response.body.pipe(res);
        }
        else {
            throw new Error('Failed to stream image data');
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});
// API routes
app.post('/api/article/list', async (req, res) => {
    try {
        const response = await fetch('http://localhost:6666/api/v1/article/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
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
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});
// Route all other requests to React app's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog/build', 'index.html'));
});
if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    // Fork workers
    const numCPUs = cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
}
else {
    console.log(`Worker ${process.pid} started`);
    // To access specific flags or arguments
    const flags = process.argv.slice(2); // Exclude 'node' and 'x.js'
    // In order to listen to localhost when test
    if (flags.length > 0) {
        app.listen(port, flags[0], () => {
            console.log(`Server is running on http://${flags[0]}:${port}`);
        });
    }
    else {
        app.listen(port, () => {
            console.log(`Server is running on http://:${port}`);
        });
    }
}
