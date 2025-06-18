import { Router } from 'express';
import { z } from 'zod';
import {
  CreateRepositorySchema,
  UpdateRepositorySchema,
  RepositoryQuerySchema,
  ApiResponseSchema,
  PaginatedResponseSchema,
} from '../schemas';
import { repositoryService } from '../services/repositoryService';
import { validateQuery, validateBody } from '../middleware/validation';

const router = Router();

// GET /api/repositories - List all repositories with filtering and pagination
router.get('/', validateQuery(RepositoryQuerySchema), async (req, res) => {
  try {
    const query = req.query as unknown as z.infer<typeof RepositoryQuerySchema>;
    const { repositories, total } = await repositoryService.getAllRepositories(query);

    const totalPages = Math.ceil(total / query.limit);

    res.json({
      success: true,
      data: repositories,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
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

// GET /api/repositories/:id - Get repository by ID
router.get('/:id', async (req, res) => {
  try {
    const repository = await repositoryService.getRepositoryById(req.params.id);
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: repository,
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

// POST /api/repositories - Create new repository
router.post('/', validateBody(CreateRepositorySchema), async (req, res) => {
  try {
    const repositoryData = req.body as z.infer<typeof CreateRepositorySchema>;
    const repository = await repositoryService.createRepository(repositoryData);

    res.status(201).json({
      success: true,
      data: repository,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bad request',
      timestamp: new Date(),
    });
  }
});

// PUT /api/repositories/:id - Update repository
router.put('/:id', validateBody(UpdateRepositorySchema), async (req, res) => {
  try {
    const updateData = req.body as z.infer<typeof UpdateRepositorySchema>;
    const repository = await repositoryService.updateRepository(req.params.id, updateData);

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: repository,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bad request',
      timestamp: new Date(),
    });
  }
});

// DELETE /api/repositories/:id - Delete repository
router.delete('/:id', async (req, res) => {
  try {
    const success = await repositoryService.deleteRepository(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
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

// POST /api/repositories/:id/access - Update last accessed time
router.post('/:id/access', async (req, res) => {
  try {
    await repositoryService.updateLastAccessed(req.params.id);

    res.json({
      success: true,
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

export default router; 