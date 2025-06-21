import { useState } from 'react';
import { Search, Clock, Star, GitBranch, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddRepositoryDialog } from './AddRepositoryDialog';
import { PROJECT_TYPES, getProjectTypeIcon, getPackageManagerColor } from '@/constants/project';
import { useRepositoryManagement } from '../hooks/useRepositoryManagement';
import type { Repository } from '../types';

export function RepositorySelector() {
  const {
    repositories,
    setRepositories,
    handleSelectRepository,
    handleToggleFavorite,
    formatLastAccessed
  } = useRepositoryManagement();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Mock repositories for demonstration
  const mockRepositories: Repository[] = [
    {
      id: '1',
      name: 'my-vite-app',
      path: '/Users/dev/projects/my-vite-app',
      type: 'vite',
      packageManager: 'npm',
      lastAccessed: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isActive: false,
      isFavorite: false,
      packageJson: {
        name: 'my-vite-app',
        version: '1.0.0',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        }
      }
    },
    {
      id: '2',
      name: 'next-dashboard',
      path: '/Users/dev/projects/next-dashboard',
      type: 'next',
      packageManager: 'pnpm',
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isActive: false,
      isFavorite: true,
      packageJson: {
        name: 'next-dashboard',
        version: '0.1.0',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start'
        }
      }
    },
    {
      id: '3',
      name: 'react-components',
      path: '/Users/dev/projects/react-components',
      type: 'react',
      packageManager: 'yarn',
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isActive: false,
      isFavorite: false,
      packageJson: {
        name: 'react-components',
        version: '2.1.0',
        scripts: {
          start: 'react-scripts start',
          build: 'react-scripts build',
          test: 'react-scripts test'
        }
      }
    },
    {
      id: '4',
      name: 'node-api',
      path: '/Users/dev/projects/node-api',
      type: 'node',
      packageManager: 'bun',
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      isActive: false,
      isFavorite: true,
      packageJson: {
        name: 'node-api',
        version: '1.2.0',
        scripts: {
          start: 'bun run server.js',
          dev: 'bun run --hot server.js',
          test: 'bun test'
        }
      }
    }
  ];

  // Initialize with mock data if empty
  if (repositories.length === 0) {
    setRepositories(mockRepositories);
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentRepositories = repositories
    .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
    .slice(0, 4);

  const favoriteRepositories = repositories
    .filter(repo => repo.isFavorite)
    .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">倉庫管理</h2>
          <p className="text-muted-foreground">管理您的開發專案和相依套件</p>
        </div>
        <div className="flex gap-2">
          <AddRepositoryDialog />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋倉庫名稱或路徑..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Favorite Repositories */}
      {favoriteRepositories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              收藏的倉庫
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {favoriteRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all hover:shadow-sm group"
                  onClick={() => handleSelectRepository(repo)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getProjectTypeIcon(repo.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{repo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatLastAccessed(repo.lastAccessed)}
                      </p>
                    </div>
                    <Star
                      className="h-4 w-4 text-yellow-500 fill-current cursor-pointer"
                      onClick={(e) => handleToggleFavorite(repo.id, e)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {repo.type}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getPackageManagerColor(repo.packageManager)}`}>
                      {repo.packageManager}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Repositories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            最近使用
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {recentRepositories.map((repo) => (
              <div
                key={repo.id}
                className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all hover:shadow-sm group"
                onClick={() => handleSelectRepository(repo)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getProjectTypeIcon(repo.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{repo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatLastAccessed(repo.lastAccessed)}
                    </p>
                  </div>
                  <Star
                    className={`h-4 w-4 cursor-pointer ${
                      repo.isFavorite 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-muted-foreground hover:text-yellow-500'
                    }`}
                    onClick={(e) => handleToggleFavorite(repo.id, e)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {repo.type}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getPackageManagerColor(repo.packageManager)}`}>
                    {repo.packageManager}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Repositories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              所有倉庫
            </span>
            <Badge variant="secondary">{filteredRepositories.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectRepository(repo)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getProjectTypeIcon(repo.type)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{repo.name}</h4>
                        {repo.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {repo.type}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPackageManagerColor(repo.packageManager)}`}>
                          {repo.packageManager}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono truncate max-w-md">
                        {repo.path}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        上次存取：{formatLastAccessed(repo.lastAccessed)}
                      </div>
                    </div>
                  </div>
                  <Star
                    className={`h-5 w-5 cursor-pointer ${
                      repo.isFavorite 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-muted-foreground hover:text-yellow-500'
                    }`}
                    onClick={(e) => handleToggleFavorite(repo.id, e)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 