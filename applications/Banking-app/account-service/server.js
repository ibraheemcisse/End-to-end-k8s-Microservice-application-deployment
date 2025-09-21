const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// In-memory account store
let accounts = [];

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Online', 
        service: 'Account Service',
        timestamp: new Date().toISOString(),
        accounts_count: accounts.length
    });
});

// Get account balance
app.get('/accounts/:username/balance', async (req, res) => {
    const { username } = req.params;
    
    try {
        // Check if user exists by calling user service
        const userResponse = await axios.get(`http://user-service:3001/users/${username}`);
        
        let account = accounts.find(a => a.username === username);
        if (!account) {
            // Create account with default balance
            account = {
                id: uuidv4(),
                username,
                balance: 1000, // Starting balance
                created_at: new Date().toISOString()
            };
            accounts.push(account);
        }
        
        res.json({ 
            username,
            balance: account.balance,
            account_id: account.id
        });
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// Update account balance
app.put('/accounts/:username/balance', async (req, res) => {
    const { username } = req.params;
    const { amount, operation } = req.body; // operation: 'add' or 'subtract'
    
    let account = accounts.find(a => a.username === username);
    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }
    
    if (operation === 'add') {
        account.balance += amount;
    } else if (operation === 'subtract') {
        if (account.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }
        account.balance -= amount;
    }
    
    res.json({ 
        message: 'Balance updated',
        username,
        new_balance: account.balance
    });
});

// Get all accounts
app.get('/accounts', (req, res) => {
    res.json({ accounts });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Account Service running on http://0.0.0.0:${port}`);
});
