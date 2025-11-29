const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error('JWT_SECRET not found in .env');
    process.exit(1);
}

const user = {
    id: 'mock-employee-id',
    username: 'employee',
    name: 'Mock Employee',
    role: 'employee',
    ranking: 5,
    win_rate: 85,
    streak: 12
};

const token = jwt.sign(user, secret, { expiresIn: '24h' });

const fs = require('fs');
const tokenData = {
    token,
    user
};
fs.writeFileSync(path.join(__dirname, 'token.json'), JSON.stringify(tokenData, null, 2));
console.log('Token saved to token.json');
