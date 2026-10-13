import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import 'express-async-errors';

// Database connections - FIXED IMPORTS
import { initializeOraclePool } from './config/oracle.js';
import { initializeMongoDBConnection } from './config/mongodb.js';

// Route imports
import healthRoutes from './routes/health.js';
import tripRoutes from './routes/trips.js';
import reviewRoutes from './routes/reviews.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'SmartMove Transport Solutions API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      trips: '/api/trips',
      reviews: '/api/reviews'
    }
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} does not exist`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    status: 500
  });
});

// Start Server and Initialize DB Connections
const startServer = async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  SmartMove Backend - Initializing...          ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // Initialize Oracle DB Pool
    console.log('📍 Connecting to Oracle Database...');
    await initializeOraclePool();
    console.log('✅ Oracle Connected\n');

    // Connect to MongoDB
    console.log('📍 Connecting to MongoDB...');
    await initializeMongoDBConnection();
    console.log('✅ MongoDB Connected\n');

    // Start listening
    app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║  🚀 SmartMove Backend Server Running          ║');
      console.log(`║  📍 http://localhost:${PORT}                      ║`);
      console.log('║  🔧 Environment: ' + (process.env.NODE_ENV || 'development').padEnd(27) + '║');
      console.log('╚════════════════════════════════════════════════╝\n');
      
      console.log('📋 Available Endpoints:');
      console.log(`   GET  /                  - Server info`);
      console.log(`   GET  /api/health        - Database status`);
      console.log(`   GET  /api/trips         - All trips`);
      console.log(`   GET  /api/reviews       - All reviews\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();