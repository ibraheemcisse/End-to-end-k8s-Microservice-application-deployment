const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory user store
let users = [];

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Online', 
        service: 'User Service',
        timestamp: new Date().toISOString(),
        users_count: users.length
    });
});

// Get all users
app.get('/users', (req, res) => {
    res.json({ users });
});

// Create user
app.post('/users', (req, res) => {
    const { username, email } = req.body;
    
    if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
    }
    
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
    }
    
    const user = {
        id: uuidv4(),
        username,
        email,
        created_at: new Date().toISOString()
    };
    
    users.push(user);
    
    res.status(201).json({ 
        message: 'User created successfully', 
        user: { ...user, password: undefined }
    });
});

// Get user by username
app.get('/users/:username', (req, res) => {
    const user = users.find(u => u.username === req.params.username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { ...user, password: undefined } });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`User Service running on http://0.0.0.0:${port}`);
});
