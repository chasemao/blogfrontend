import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';

const app = express();
const port = 5000;

interface Article {
  title: string;
  // Define other properties if necessary
}

interface ApiResponse {
  data: Article[];
  // Define other properties if necessary
}

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to log request
app.use((req: Request, res: Response, next: NextFunction) => {
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

app.get('/sitemap.txt', async (req: Request, res: Response) => {
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

    const data = await response.json() as ApiResponse; // Type assertion
    let articleTitles = data.data.map(
      article => `${req.protocol}://${req.get('host')}/article/` + article.title
    ).join('\n');
    articleTitles = `${req.protocol}://${req.get('host')}/\n` + articleTitles
    res.setHeader('Content-Type', 'text/plain');
    res.send(articleTitles);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
})

app.get('/article/static/:image', async (req: Request, res: Response) => {
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
    } else {
      throw new Error('Failed to stream image data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
})

// API routes
app.post('/api/article/list', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.post('/api/article/get', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Route all other requests to React app's index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'blog/build', 'index.html'));
});

app.listen(port, 'localhost', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
