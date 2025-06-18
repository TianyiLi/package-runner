import { Router } from 'express';
import { z } from 'zod';
import {
  CreateEnvVariableSchema,
  UpdateEnvVariableSchema,
  PaginationQuerySchema,
} from '../schemas';
import { envService } from '../services/envService';
import { validateQuery, validateBody } from '../middleware/validation';

const router = Router();

// GET /api/env - List environment variables (optionally filter by repository)
router.get('/', validateQuery(PaginationQuerySchema.extend({
  repositoryId: z.string().optional(),
  maskSecrets: z.coerce.boolean().default(true),
})), async (req, res) => {
  try {
    const query = req.query as unknown as z.infer<typeof PaginationQuerySchema> & { 
      repositoryId?: string;
      maskSecrets: boolean;
    };
    
    let envVariables = await envService.getAllEnvVariables(query.repositoryId);
    
    // Mask secrets if requested
    if (query.maskSecrets) {
      envVariables = envService.maskSecrets(envVariables);
    }
    
    // Apply pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedEnvVars = envVariables.slice(startIndex, endIndex);
    const total = envVariables.length;
    const totalPages = Math.ceil(total / query.limit);

    res.json({
      success: true,
      data: paginatedEnvVars,
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

// GET /api/env/:id - Get environment variable by ID
router.get('/:id', async (req, res) => {
  try {
    const envVariable = await envService.getEnvVariableById(req.params.id);
    
    if (!envVariable) {
      return res.status(404).json({
        success: false,
        error: 'Environment variable not found',
        timestamp: new Date(),
      });
    }

    // Check if we should mask the secret
    const maskSecrets = req.query.maskSecrets !== 'false';
    const responseData = maskSecrets && envVariable.isSecret 
      ? { ...envVariable, value: '*'.repeat(8) }
      : envVariable;

    res.json({
      success: true,
      data: responseData,
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

// POST /api/env - Create new environment variable
router.post('/', validateBody(CreateEnvVariableSchema), async (req, res) => {
  try {
    const envData = req.body as z.infer<typeof CreateEnvVariableSchema>;
    const envVariable = await envService.createEnvVariable(envData);

    res.status(201).json({
      success: true,
      data: envVariable,
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

// PUT /api/env/:id - Update environment variable
router.put('/:id', validateBody(UpdateEnvVariableSchema), async (req, res) => {
  try {
    const updateData = req.body as z.infer<typeof UpdateEnvVariableSchema>;
    const envVariable = await envService.updateEnvVariable(req.params.id, updateData);

    if (!envVariable) {
      return res.status(404).json({
        success: false,
        error: 'Environment variable not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: envVariable,
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

// DELETE /api/env/:id - Delete environment variable
router.delete('/:id', async (req, res) => {
  try {
    const success = await envService.deleteEnvVariable(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Environment variable not found',
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

// GET /api/env/repository/:repositoryId/file - Generate .env file content
router.get('/repository/:repositoryId/file', async (req, res) => {
  try {
    const envContent = await envService.generateEnvFile(req.params.repositoryId);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=".env"');
    res.send(envContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
});

// POST /api/env/repository/:repositoryId/import - Import .env file
router.post('/repository/:repositoryId/import', async (req, res) => {
  try {
    const { envContent } = req.body;
    
    if (!envContent || typeof envContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'envContent is required and must be a string',
        timestamp: new Date(),
      });
    }

    const importedVars = await envService.importEnvFile(req.params.repositoryId, envContent);

    res.json({
      success: true,
      data: importedVars,
      message: `Imported ${importedVars.length} environment variables`,
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

// POST /api/env/repository/:repositoryId/values - Get specific environment variable values by keys
router.post('/repository/:repositoryId/values', async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!Array.isArray(keys)) {
      return res.status(400).json({
        success: false,
        error: 'keys must be an array of strings',
        timestamp: new Date(),
      });
    }

    const values = await envService.getEnvVariablesByKeys(req.params.repositoryId, keys);

    res.json({
      success: true,
      data: values,
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