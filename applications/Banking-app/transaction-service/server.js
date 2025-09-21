const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

// In-memory transaction store
let transactions = [];

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Online', 
        service: 'Transaction Service',
        timestamp: new Date().toISOString(),
        total_transactions: transactions.length
    });
});

// Create transaction
app.post('/transactions', async (req, res) => {
    const { from, to, amount, type } = req.body;
    
    if (!from || !amount || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        // For deposits, just add money to account
        if (type === 'deposit') {
            await axios.put(`http://account-service:3002/accounts/${from}/balance`, {
                amount: amount,
                operation: 'add'
            });
            
            const transaction = {
                id: uuidv4(),
                from,
                to: to || 'bank',
                amount,
                type,
                status: 'completed',
                timestamp: new Date().toISOString()
            };
            
            transactions.push(transaction);
            
            return res.status(201).json({
                message: 'Transaction completed',
                transaction
            });
        }
        
        // For transfers, check balance and process
        if (type === 'transfer') {
            // Check sender balance
            const balanceResponse = await axios.get(`http://account-service:3002/accounts/${from}/balance`);
            
            if (balanceResponse.data.balance < amount) {
                return res.status(400).json({ error: 'Insufficient funds' });
            }
            
            // Deduct from sender
            await axios.put(`http://account-service:3002/accounts/${from}/balance`, {
                amount: amount,
                operation: 'subtract'
            });
            
            // Add to receiver (if not 'bank')
            if (to !== 'bank') {
                await axios.put(`http://account-service:3002/accounts/${to}/balance`, {
                    amount: amount,
                    operation: 'add'
                });
            }
        }
        
        const transaction = {
            id: uuidv4(),
            from,
            to,
            amount,
            type,
            status: 'completed',
            timestamp: new Date().toISOString()
        };
        
        transactions.push(transaction);
        
        res.status(201).json({
            message: 'Transaction completed',
            transaction
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed', details: error.message });
    }
});

// Get transaction history
app.get('/transactions/:username', (req, res) => {
    const { username } = req.params;
    const userTransactions = transactions.filter(t => t.from === username || t.to === username);
    
    res.json({ 
        username,
        transactions: userTransactions 
    });
});

// Get all transactions
app.get('/transactions', (req, res) => {
    res.json({ transactions });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Transaction Service running on http://0.0.0.0:${port}`);
});
