import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { selectedRepositoryAtom } from '@/store/atoms';
import { 
  Play, 
  Settings, 
  FileText, 
  Activity,
  Code,
  Package,
  ArrowLeft
} from 'lucide-react';

const sidebarItems = [
  { id: 'scripts', label: 'Scripts', icon: Play, path: '/scripts' },
  { id: 'environment', label: 'Environment', icon: Settings, path: '/environment' },
  { id: 'config', label: 'Configuration', icon: FileText, path: '/config' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, path: '/monitoring' },
  { id: 'editor', label: 'Editor', icon: Code, path: '/editor' },
];

export function Sidebar() {
  const location = useLocation();
  const [selectedRepo, setSelectedRepo] = useAtom(selectedRepositoryAtom);

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'vite':
        return '⚡';
      case 'next':
        return '▲';
      case 'react':
        return '⚛️';
      case 'node':
        return '🟢';
      default:
        return '📦';
    }
  };

  const handleBackToRepositories = () => {
    setSelectedRepo(null);
  };

  // If no repository is selected, show repository selection prompt
  if (!selectedRepo) {
    return (
      <aside className="w-64 border-r bg-muted/50 h-[calc(100vh-3.5rem)] sticky top-0">
        <div className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm">No Repository Selected</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select a repository to manage its packages and scripts
              </p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-muted/50 h-[calc(100vh-3.5rem)] sticky top-0">
      <div className="p-6">
        {/* Back to Repositories */}
        <Link to="/repositories">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start mb-4 text-muted-foreground hover:text-foreground"
            onClick={handleBackToRepositories}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Repositories
          </Button>
        </Link>

        {/* Repository Info */}
        <div className="mb-6 p-4 bg-background rounded-lg border">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">{getProjectTypeIcon(selectedRepo.type)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{selectedRepo.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 truncate" title={selectedRepo.path}>
            {selectedRepo.path}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded font-medium">
              {selectedRepo.type.toUpperCase()}
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded font-medium">
              {selectedRepo.packageManager}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            MANAGEMENT
          </div>
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.id} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start transition-colors',
                    isActive && 'bg-secondary shadow-sm font-medium'
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-3 px-2">
            QUICK ACTIONS
          </div>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Code className="mr-3 h-3 w-3" />
              Open in VS Code
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Package className="mr-3 h-3 w-3" />
              Install Dependencies
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}