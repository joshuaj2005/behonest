require('dotenv').config();
const express = require('express');
const app = require('./app');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { initializeSocket } = require('./socket');
const path = require('path');
const { db } = require('./config/firebase');
const friendsRoutes = require('./routes/friends');
const spotRoutes = require('./routes/spots');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Test Firebase Connection
const testFirebaseConnection = async () => {
  try {
    const testRef = db.collection('test').doc('connection-test');
    await testRef.set({
      timestamp: new Date(),
      status: 'connected'
    });
    console.log('Firebase connected successfully');
  } catch (error) {
    console.error('Firebase connection error:', error);
  }
};

// Test Firebase connection
testFirebaseConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/reels', require('./routes/reels'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/friends', friendsRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/chat', chatRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Export CORS options for socket.io
module.exports.corsOptions = corsOptions;

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
}); 