import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

const app = express()
const PORT = process.env.PORT || 3000; 
const JWT_SECRET = process.env.JWT_SECRET
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));

app.use(express.json()); 

app.use(cookieParser());

// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI; 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Keep the connection open for our CRUD operations
let db;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("school"); // Database name
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
connectDB();


// Authentication middleware 4 login
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login.html');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/login.html');
    }
    req.user = user;
    next();
  });
}

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Only allow root/root login
    if (username === 'root' && password === 'root') {
      const token = jwt.sign(
        { userId: 'root', username: 'root', isRoot: true },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.json({ 
        message: 'Login successful',
        username: 'root',
        redirectTo: '/records.html'
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});



app.get('/', (req, res) => {
  res.redirect('/login.html');
})

// endpoints...middlewares...apis? 

// send an html file
app.get('/barry', authenticateToken, (req, res) => {
 
  res.sendFile(join(__dirname, 'public', 'barry.html')) 

})

app.get('/api/barry', authenticateToken, (req, res) => {
  // res.send('barry. <a href="/">home</a>')
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.get('/api/query', authenticateToken, (req, res) => {

  //console.log("client request with query param:", req.query.name); 
  const name = req.query.name; 
  res.json({"message": `Hi, ${name}. How are you?`});

  // receivedData.queries.push(req.query.name || 'Guest');
  // const name = req.query.name || 'Guest';
  // res.json({ message: `Hello, ${name} (from query param)` });
});

app.get('/api/url/:iaddasfsd', authenticateToken, (req, res) => {

  console.log("client request with URL param:", req.params.iaddasfsd); 
  // const name = req.query.name; 
  // res.json({"message": `Hi, ${name}. How are you?`});

});


app.get('/api/body', authenticateToken, (req, res) => {

  console.log("client request with POST body:", req.query); 
  // const name = req.body.name; 
  // res.json({"message": `Hi, ${name}. How are you?`});

});

// Record page 
app.post('/api/records', authenticateToken, async (req, res) => {
  try {
    const { title, artist, genre } = req.body;

    if (!title || !artist || !genre) {
      return res.status(400).json({ error: 'Title, artist, and genre are required' });
    }

    const record = {
      title,
      artist,
      genre,
      createdAt: new Date()
    };

    const result = await db.collection('records').insertOne(record);
    
    res.status(201).json({ 
      message: 'Record added successfully', 
      recordId: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add record: ' + error.message });
  }
});

// READ - Get all records
app.get('/api/records', authenticateToken, async (req, res) => {
  try {
    const records = await db.collection('records').find({}).toArray();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch records: ' + error.message });
  }
});

// UPDATE - Update a record
app.put('/api/records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove any fields that shouldn't be updated
    delete updates._id;

    const result = await db.collection('records').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record: ' + error.message });
  }
});

// DELETE - Delete a record
app.delete('/api/records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.collection('records').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record: ' + error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})