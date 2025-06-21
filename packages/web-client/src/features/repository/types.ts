import { PackageJson } from '@/types';

export type ProjectType = 'vite' | 'next' | 'react' | 'node' | 'vue' | 'angular' | 'unknown';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface Repository {
  id: string;
  name: string;
  path: string;
  type: ProjectType;
  packageManager: PackageManager;
  lastAccessed: Date;
  isActive: boolean;
  isFavorite?: boolean;
  packageJson?: PackageJson;
  configFiles?: string[];
}

export interface AddRepositoryFormData {
  name: string;
  path: string;
  type: ProjectType | '';
  packageManager: PackageManager | '';
} 