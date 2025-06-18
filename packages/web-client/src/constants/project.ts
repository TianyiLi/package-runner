import { Repository } from '@/store/atoms';

export const PROJECT_TYPES = [
  { value: 'vite', label: 'Vite', icon: '⚡', description: 'React + TypeScript' },
  { value: 'next', label: 'Next.js', icon: '▲', description: 'Full-stack React' },
  { value: 'react', label: 'React', icon: '⚛️', description: 'Create React App' },
  { value: 'node', label: 'Node.js', icon: '🟢', description: 'Backend API' },
] as const;

export const PACKAGE_MANAGERS = [
  { value: 'bun', label: 'Bun', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800' },
  { value: 'pnpm', label: 'pnpm', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800' },
  { value: 'yarn', label: 'Yarn', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' },
  { value: 'npm', label: 'npm', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
] as const;

export function getProjectTypeIcon(type: string): string {
  const projectType = PROJECT_TYPES.find(pt => pt.value === type);
  return projectType?.icon || '📦';
}

export function getPackageManagerColor(pm: string): string {
  const packageManager = PACKAGE_MANAGERS.find(pkg => pkg.value === pm);
  return packageManager?.color || 'bg-gray-50 text-gray-700 border-gray-200';
}

export type ProjectType = Repository['type'];
export type PackageManager = Repository['packageManager']; 