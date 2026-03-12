const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const { PORT, CLIENT_URL, NODE_ENV } = require('./config/env');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./sockets');
const AppError = require('./utils/AppError');

const app = express();
const server = http.createServer(app);

// CORS origins — support comma-separated CLIENT_URL for multiple origins
const allowedOrigins = CLIENT_URL
  ? CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

console.log('Allowed CORS origins:', allowedOrigins);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// CORS — must be BEFORE helmet so preflight OPTIONS requests get handled
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security headers
app.use(helmet());

// Request logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// 404 handler for unmatched routes
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(errorHandler);

// Setup socket handlers
setupSocket(io);

// Start HTTP server immediately, then connect to database
server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api/v1`);
});

connectDB().catch((err) => {
  console.error('Failed to connect to database:', err.message);
  console.error('Server is running but database is unavailable. API calls will fail.');
});

module.exports = { app, server, io };
