import { useState } from 'react';
import { useAtom } from 'jotai';
import { Search, Clock, Star, GitBranch, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { repositoriesAtom, selectedRepositoryAtom, Repository } from '@/store/atoms';
import { useNavigate } from '@tanstack/react-router';
import { AddRepositoryDialog } from './AddRepositoryDialog';
import { PROJECT_TYPES, getProjectTypeIcon, getPackageManagerColor } from '@/constants/project';

export function RepositorySelector() {
  const [repositories, setRepositories] = useAtom(repositoriesAtom);
  const [, setSelectedRepository] = useAtom(selectedRepositoryAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

  const handleSelectRepository = (repo: Repository) => {
    // Update last accessed time
    const updatedRepo = { ...repo, lastAccessed: new Date() };
    setRepositories(prev => 
      prev.map(r => r.id === repo.id ? updatedRepo : r)
    );
    
    setSelectedRepository(updatedRepo);
    navigate({ to: '/scripts' });
  };

  const handleToggleFavorite = (repoId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent repository selection when clicking star
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId ? { ...repo, isFavorite: !repo.isFavorite } : repo
      )
    );
  };

  const formatLastAccessed = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Repositories</h2>
          <p className="text-muted-foreground">Manage your development projects and their dependencies</p>
        </div>
        <div className="flex gap-2">
          <AddRepositoryDialog />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories by name or path..."
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
                  <Badge variant="outline" className={`text-xs ${getPackageManagerColor(repo.packageManager)}`}>
                    {repo.packageManager}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Repositories */}
      {recentRepositories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recently Accessed
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
                      className={`h-4 w-4 cursor-pointer transition-colors ${
                        repo.isFavorite 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                      }`}
                      onClick={(e) => handleToggleFavorite(repo.id, e)}
                    />
                  </div>
                  <Badge variant="outline" className={`text-xs ${getPackageManagerColor(repo.packageManager)}`}>
                    {repo.packageManager}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Repositories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Repositories</span>
            <Badge variant="secondary">{filteredRepositories.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md group"
                  onClick={() => handleSelectRepository(repo)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getProjectTypeIcon(repo.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{repo.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{repo.type} project</p>
                      </div>
                    </div>
                    <Star 
                      className={`h-4 w-4 cursor-pointer transition-colors ${
                        repo.isFavorite 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                      }`}
                      onClick={(e) => handleToggleFavorite(repo.id, e)}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 truncate" title={repo.path}>
                    {repo.path}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={`text-xs ${getPackageManagerColor(repo.packageManager)}`}>
                      {repo.packageManager}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      v{repo.packageJson?.version || '1.0.0'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      <span>{Object.keys(repo.packageJson?.scripts || {}).length} scripts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatLastAccessed(repo.lastAccessed)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {PROJECT_TYPES.map((projectType) => (
              <Button 
                key={projectType.value}
                variant="outline" 
                className="h-auto p-4 flex-col gap-3 hover:bg-muted/50"
              >
                <div className="text-3xl">{projectType.icon}</div>
                <div className="text-center">
                  <p className="font-medium">{projectType.label}</p>
                  <p className="text-xs text-muted-foreground">{projectType.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}