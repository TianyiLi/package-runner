import { PackageManager, ProjectType } from '@/features/repository/types';
import { PackageJson } from '@/types';
import { atom } from 'jotai';

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

export interface Script {
  name: string;
  command: string;
  isRunning: boolean;
  lastRun?: Date;
  output?: string[];
  repositoryId: string;
}

export interface EnvVariable {
  key: string;
  value: string;
  isSecret: boolean;
  repositoryId: string;
}

export interface ProjectConfig {
  name: string;
  type: 'vite' | 'next' | 'react' | 'node' | 'unknown';
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  configFiles: string[];
  repositoryId: string;
}

// Repository management atoms
export const repositoriesAtom = atom<Repository[]>([]);
export const selectedRepositoryAtom = atom<Repository | null>(null);

// Project-specific atoms (these will be filtered by selected repository)
export const scriptsAtom = atom<Script[]>([]);
export const envVariablesAtom = atom<EnvVariable[]>([]);
export const projectConfigAtom = atom<ProjectConfig>({
  name: '',
  type: 'unknown',
  packageManager: 'npm',
  configFiles: [],
  repositoryId: ''
});

// Derived atoms for current repository data
export const currentRepositoryScriptsAtom = atom((get) => {
  const selectedRepo = get(selectedRepositoryAtom);
  const allScripts = get(scriptsAtom);
  if (!selectedRepo) {
    return []
  }
  return allScripts.filter(script => script.repositoryId === selectedRepo.id);
});

export const currentRepositoryEnvVarsAtom = atom((get) => {
  const selectedRepo = get(selectedRepositoryAtom);
  const allEnvVars = get(envVariablesAtom);
  if (!selectedRepo) {
    return []
  }
  return allEnvVars.filter(env => env.repositoryId === selectedRepo.id);
});

export const activeTabAtom = atom<string>('scripts');
export const isLoadingAtom = atom(false);