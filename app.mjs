
// app.mjs (or app.js with "type": "module")
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import cors from 'cors';

const myVar = 'Hello from the server!';    
const app = express()
// Store received data in memory
const receivedData = {
  queries: [],
  urls: [],
  posts: []
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000; 

app.use(express.json()); // Middleware for parsing JSON bodies (replaces body-parser?)
app.use(express.static(join(__dirname, 'public')));
app.use(cors());


// our home page. send a string. 
app.get('/', (req, res) => {
  res.send('Hello Express from Render 😍😍😍. <a href="justin">justin</a>')
})

// endpoints...middlewares...apis? 
// send an html file

// data from server to client. 
app.get('/justin', (req, res) => {
    // Inject a server variable into barry.html
    readFile(join(__dirname, 'public', 'justin.html'), 'utf8')
      .then(html => {
        // Replace a placeholder in the HTML (e.g., {{myVar}})
        const injectedHtml = html.replace('{{myVar}}', myVar);
        res.send(injectedHtml);
      })
      .catch(err => {
        res.status(500).send('Error loading page');
      });
})

app.get('/api/justin', (req, res) => {
  // res.send('barry. <a href="/">home</a>')
  const myVar = 'Hello from server!';
  res.json({ myVar });
})



// Getting data from the client: 
// 1. Query parameter example: /api/query?name=Barry
app.get('/api/query', (req, res) => {
  receivedData.queries.push(req.query.name || 'Guest');
  const name = req.query.name || 'Guest';
  res.json({ message: `Hello, ${name} (from query param)` });
});

// 2. URL parameter example: /api/url/123
app.get('/api/url/:id', (req, res) => {
  receivedData.urls.push(req.params.id);
  const id = req.params.id;
  res.json({ message: `You sent id: ${id} (from URL param)` });
});

// 3. POST body example: POST to /api/body with { "name": "Barry" }
app.post('/api/body', (req, res) => {
    const name = req.body.name || 'Guest';
  res.json({ message: `Hello, ${name} (from POST body)` });

  receivedData.posts.push(req.body.name || 'Guest');
});

// Endpoint to summarize all received client data
app.get('/api/summary', (req, res) => {
  res.json(receivedData);
});


// Live typing endpoint: echo to server console
app.post('/api/live', (req, res) => {
  const value = req.body.value;
  console.log('Live input:', value);
  res.json({ message: `Saved: ${value}` });
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})