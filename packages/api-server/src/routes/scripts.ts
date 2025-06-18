import { Router } from 'express';
import { z } from 'zod';
import {
  CreateScriptSchema,
  ExecuteScriptSchema,
  PaginationQuerySchema,
} from '../schemas';
import { scriptService } from '../services/scriptService';
import { validateQuery, validateBody } from '../middleware/validation';

const router = Router();

// GET /api/scripts - List all scripts (optionally filter by repository)
router.get('/', validateQuery(PaginationQuerySchema.extend({
  repositoryId: z.string().optional(),
})), async (req, res) => {
  try {
    const query = req.query as unknown as z.infer<typeof PaginationQuerySchema> & { repositoryId?: string };
    const scripts = await scriptService.getAllScripts(query.repositoryId);
    
    // Apply pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedScripts = scripts.slice(startIndex, endIndex);
    const total = scripts.length;
    const totalPages = Math.ceil(total / query.limit);

    res.json({
      success: true,
      data: paginatedScripts,
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

// GET /api/scripts/running - Get all running scripts
router.get('/running', async (req, res) => {
  try {
    const scripts = await scriptService.getRunningScripts();

    res.json({
      success: true,
      data: scripts,
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

// GET /api/scripts/:id - Get script by ID
router.get('/:id', async (req, res) => {
  try {
    const script = await scriptService.getScriptById(req.params.id);
    
    if (!script) {
      return res.status(404).json({
        success: false,
        error: 'Script not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: script,
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

// POST /api/scripts - Create new script
router.post('/', validateBody(CreateScriptSchema), async (req, res) => {
  try {
    const scriptData = req.body as z.infer<typeof CreateScriptSchema>;
    const script = await scriptService.createScript(scriptData);

    res.status(201).json({
      success: true,
      data: script,
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

// PUT /api/scripts/:id - Update script
router.put('/:id', validateBody(CreateScriptSchema.partial()), async (req, res) => {
  try {
    const updateData = req.body as Partial<z.infer<typeof CreateScriptSchema>>;
    const script = await scriptService.updateScript(req.params.id, updateData);

    if (!script) {
      return res.status(404).json({
        success: false,
        error: 'Script not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: script,
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

// DELETE /api/scripts/:id - Delete script
router.delete('/:id', async (req, res) => {
  try {
    const success = await scriptService.deleteScript(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Script not found',
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

// POST /api/scripts/:id/execute - Execute script
router.post('/:id/execute', validateBody(ExecuteScriptSchema.omit({ scriptId: true })), async (req, res) => {
  try {
    const executeData = {
      scriptId: req.params.id,
      ...req.body,
    } as z.infer<typeof ExecuteScriptSchema>;

    const script = await scriptService.executeScript(executeData);

    res.json({
      success: true,
      data: script,
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

// POST /api/scripts/:id/stop - Stop script execution
router.post('/:id/stop', async (req, res) => {
  try {
    const success = await scriptService.stopScript(req.params.id);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Script is not running or not found',
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

// GET /api/scripts/:id/output - Get script output
router.get('/:id/output', async (req, res) => {
  try {
    const output = await scriptService.getScriptOutput(req.params.id);

    res.json({
      success: true,
      data: output,
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