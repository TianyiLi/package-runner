import { EnvVariable } from '@/store/atoms';

export interface ProjectScript {
  name: string;
  command: string;
  isRunning: boolean;
  repositoryId: string;
  lastRun?: Date;
  output?: string[];
}

export interface ProjectConfig {
  name: string;
  version: string;
  type: string;
  scripts: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ProjectEnvironment extends EnvVariable {
  repositoryId: string;
}

export type ProjectType = 'vite' | 'next' | 'react' | 'node' | 'vue' | 'angular';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface MonitoringData {
  cpu: number;
  memory: number;
  timestamp: Date;
} 