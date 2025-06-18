import { z } from 'zod';

// Repository Schemas
export const RepositorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  path: z.string().min(1),
  type: z.enum(['vite', 'next', 'react', 'node', 'unknown']),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
  lastAccessed: z.date(),
  isActive: z.boolean(),
  packageJson: z.record(z.any()).optional(),
  configFiles: z.array(z.string()).optional(),
});

export const CreateRepositorySchema = z.object({
  name: z.string().min(1, 'Repository name is required'),
  path: z.string().min(1, 'Repository path is required'),
  type: z.enum(['vite', 'next', 'react', 'node', 'unknown']),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
});

export const UpdateRepositorySchema = CreateRepositorySchema.partial();

// Script Schemas
export const ScriptSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  command: z.string().min(1),
  isRunning: z.boolean(),
  lastRun: z.date().optional(),
  output: z.array(z.string()).optional(),
  repositoryId: z.string(),
  pid: z.number().optional(),
});

export const CreateScriptSchema = z.object({
  name: z.string().min(1, 'Script name is required'),
  command: z.string().min(1, 'Script command is required'),
  repositoryId: z.string().min(1, 'Repository ID is required'),
});

export const ExecuteScriptSchema = z.object({
  scriptId: z.string(),
  arguments: z.string().optional(),
  environment: z.record(z.string()).optional(),
});

// Environment Variable Schemas
export const EnvVariableSchema = z.object({
  id: z.string(),
  key: z.string().min(1).regex(/^[A-Z_][A-Z0-9_]*$/, 'Invalid environment variable name'),
  value: z.string().min(1),
  isSecret: z.boolean(),
  repositoryId: z.string(),
});

export const CreateEnvVariableSchema = z.object({
  key: z.string().min(1).regex(/^[A-Z_][A-Z0-9_]*$/, 'Invalid environment variable name'),
  value: z.string().min(1, 'Value is required'),
  isSecret: z.boolean().default(false),
  repositoryId: z.string().min(1, 'Repository ID is required'),
});

export const UpdateEnvVariableSchema = CreateEnvVariableSchema.partial();

// Project Configuration Schemas
export const ProjectConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['vite', 'next', 'react', 'node', 'unknown']),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
  configFiles: z.array(z.string()),
  repositoryId: z.string(),
  settings: z.record(z.any()).optional(),
});

export const UpdateProjectConfigSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['vite', 'next', 'react', 'node', 'unknown']).optional(),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional(),
  configFiles: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

// Monitoring Schemas
export const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  level: z.enum(['info', 'warn', 'error', 'debug']),
  message: z.string(),
  source: z.string(),
  repositoryId: z.string().optional(),
  scriptId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const SystemStatusSchema = z.object({
  status: z.enum(['healthy', 'warning', 'error']),
  uptime: z.number(),
  memoryUsage: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
  cpuUsage: z.number(),
  activeScripts: z.number(),
  totalRepositories: z.number(),
});

// API Response Schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.date(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Query Parameters Schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const RepositoryQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  type: z.enum(['vite', 'next', 'react', 'node', 'unknown']).optional(),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional(),
});

export const LogQuerySchema = PaginationQuerySchema.extend({
  level: z.enum(['info', 'warn', 'error', 'debug']).optional(),
  source: z.string().optional(),
  repositoryId: z.string().optional(),
  scriptId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Type exports
export type Repository = z.infer<typeof RepositorySchema>;
export type CreateRepository = z.infer<typeof CreateRepositorySchema>;
export type UpdateRepository = z.infer<typeof UpdateRepositorySchema>;

export type Script = z.infer<typeof ScriptSchema>;
export type CreateScript = z.infer<typeof CreateScriptSchema>;
export type ExecuteScript = z.infer<typeof ExecuteScriptSchema>;

export type EnvVariable = z.infer<typeof EnvVariableSchema>;
export type CreateEnvVariable = z.infer<typeof CreateEnvVariableSchema>;
export type UpdateEnvVariable = z.infer<typeof UpdateEnvVariableSchema>;

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type UpdateProjectConfig = z.infer<typeof UpdateProjectConfigSchema>;

export type LogEntry = z.infer<typeof LogEntrySchema>;
export type SystemStatus = z.infer<typeof SystemStatusSchema>;

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type RepositoryQuery = z.infer<typeof RepositoryQuerySchema>;
export type LogQuery = z.infer<typeof LogQuerySchema>; 