import express from 'express';
import cors from 'cors';
import { z } from 'zod';

// Import routes
import repositoriesRouter from './routes/repositories';
import scriptsRouter from './routes/scripts';
import envRouter from './routes/env';

// Import services for initialization
import { repositoryService } from './services/repositoryService';
import { scriptService } from './services/scriptService';
import { envService } from './services/envService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/repositories', repositoriesRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/env', envRouter);

// System status endpoint
app.get('/api/system/status', async (req, res) => {
  try {
    const runningScripts = await scriptService.getRunningScripts();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        },
        cpuUsage: process.cpuUsage(),
        activeScripts: runningScripts.length,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors,
      timestamp: new Date(),
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date(),
  });
});

// Initialize services with mock data
async function initializeServices() {
  try {
    console.log('Initializing services with mock data...');
    
    // Initialize repositories
    await repositoryService.initializeWithMockData();
    
    // Initialize scripts for each repository
    const { repositories } = await repositoryService.getAllRepositories();
    for (const repo of repositories) {
      await scriptService.initializeWithMockData(repo.id);
      await envService.initializeWithMockData(repo.id);
    }
    
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await scriptService.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await scriptService.cleanup();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  
  // Initialize services
  await initializeServices();
}); 