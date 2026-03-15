require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const studentsRouter = require('./routes/students');
const recruiterRouter = require('./routes/recruiter');
const analyticsRouter = require('./routes/analytics');
const authRouter = require('./routes/auth');
const { testConnection } = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 5000;

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRouter);
app.use('/students', studentsRouter);
app.use('/recruiter', recruiterRouter);
app.use('/analytics', analyticsRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server only after testing database connection
const startServer = async () => {
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.error('Failed to connect to database. Please check your .env file and database settings.');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();
