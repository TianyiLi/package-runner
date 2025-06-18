import { Repository, CreateRepository, UpdateRepository } from '../schemas';
import fs from 'fs/promises';
import path from 'path';

class RepositoryService {
  private repositories: Repository[] = [];

  async getAllRepositories(query?: {
    search?: string;
    type?: string;
    packageManager?: string;
    page?: number;
    limit?: number;
  }): Promise<{ repositories: Repository[]; total: number }> {
    let filtered = [...this.repositories];

    // Apply filters
    if (query?.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(search) ||
        repo.path.toLowerCase().includes(search)
      );
    }

    if (query?.type) {
      filtered = filtered.filter(repo => repo.type === query.type);
    }

    if (query?.packageManager) {
      filtered = filtered.filter(repo => repo.packageManager === query.packageManager);
    }

    // Pagination
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const repositories = filtered.slice(startIndex, endIndex);
    const total = filtered.length;

    return { repositories, total };
  }

  async getRepositoryById(id: string): Promise<Repository | null> {
    return this.repositories.find(repo => repo.id === id) || null;
  }

  async createRepository(data: CreateRepository): Promise<Repository> {
    // Validate path exists
    try {
      await fs.access(data.path);
    } catch (error) {
      throw new Error('Repository path does not exist');
    }

    // Try to read package.json
    let packageJson;
    try {
      const packageJsonPath = path.join(data.path, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(packageJsonContent);
    } catch (error) {
      console.warn(`Could not read package.json for ${data.name}`);
    }

    // Detect config files
    const configFiles = await this.detectConfigFiles(data.path);

    const repository: Repository = {
      id: Date.now().toString(),
      ...data,
      lastAccessed: new Date(),
      isActive: false,
      packageJson,
      configFiles,
    };

    this.repositories.push(repository);
    return repository;
  }

  async updateRepository(id: string, data: UpdateRepository): Promise<Repository | null> {
    const index = this.repositories.findIndex(repo => repo.id === id);
    if (index === -1) return null;

    const updatedRepository: Repository = {
      ...this.repositories[index],
      ...data,
    };

    this.repositories[index] = updatedRepository;
    return updatedRepository;
  }

  async deleteRepository(id: string): Promise<boolean> {
    const index = this.repositories.findIndex(repo => repo.id === id);
    if (index === -1) return false;

    this.repositories.splice(index, 1);
    return true;
  }

  async updateLastAccessed(id: string): Promise<void> {
    const repository = this.repositories.find(repo => repo.id === id);
    if (repository) {
      repository.lastAccessed = new Date();
    }
  }

  private async detectConfigFiles(repositoryPath: string): Promise<string[]> {
    const configFiles: string[] = [];
    const possibleConfigs = [
      'vite.config.js',
      'vite.config.ts',
      'next.config.js',
      'next.config.ts',
      'webpack.config.js',
      'rollup.config.js',
      'tsconfig.json',
      'tailwind.config.js',
      'postcss.config.js',
      '.eslintrc.js',
      '.eslintrc.json',
      'prettier.config.js',
    ];

    for (const configFile of possibleConfigs) {
      try {
        await fs.access(path.join(repositoryPath, configFile));
        configFiles.push(configFile);
      } catch (error) {
        // File doesn't exist, skip
      }
    }

    return configFiles;
  }

  async initializeWithMockData(): Promise<void> {
    if (this.repositories.length === 0) {
      this.repositories = [
        {
          id: '1',
          name: 'my-vite-app',
          path: '/Users/dev/projects/my-vite-app',
          type: 'vite',
          packageManager: 'npm',
          lastAccessed: new Date(Date.now() - 1000 * 60 * 30),
          isActive: false,
          packageJson: {
            name: 'my-vite-app',
            version: '1.0.0',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            }
          },
          configFiles: ['vite.config.ts', 'tsconfig.json']
        },
        {
          id: '2',
          name: 'next-dashboard',
          path: '/Users/dev/projects/next-dashboard',
          type: 'next',
          packageManager: 'pnpm',
          lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isActive: false,
          packageJson: {
            name: 'next-dashboard',
            version: '0.1.0',
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start'
            }
          },
          configFiles: ['next.config.js', 'tsconfig.json']
        }
      ];
    }
  }
}

export const repositoryService = new RepositoryService(); 