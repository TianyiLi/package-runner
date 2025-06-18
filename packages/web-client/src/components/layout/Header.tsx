import { Moon, Sun, Package, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAtom } from 'jotai';
import { selectedRepositoryAtom } from '@/store/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { setTheme } = useTheme();
  const [selectedRepo] = useAtom(selectedRepositoryAtom);

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

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 items-center px-6 w-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Package Manager</h1>
          </div>
          
          {selectedRepo && (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-px bg-border" />
              <Badge variant="outline" className="flex items-center gap-2">
                <span className="text-sm">{getProjectTypeIcon(selectedRepo.type)}</span>
                <span className="font-medium">{selectedRepo.name}</span>
              </Badge>
            </div>
          )}
        </div>
        
        <div className="ml-auto flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}