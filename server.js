const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./socket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Expose io to routes
app.set('io', io);

// Socket Logic
socketHandler(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));

// Error Handling
app.use(errorHandler);

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@cimrs.com';
        const exists = await User.findOne({ email: adminEmail });
        if (!exists) {
            const admin = new User({
                username: 'Administrator',
                email: adminEmail,
                password: 'admin123', // Will be hashed automatically
                role: 'admin'
            });
            await admin.save();
            console.log('*** ADMIN ACCOUNT CREATED: admin@cimrs.com / admin123 ***');
        }
    } catch (err) {
        console.error('Admin seed error:', err);
    }
};


seedAdmin();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));