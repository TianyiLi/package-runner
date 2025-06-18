import { useState } from 'react';
import { useAtom } from 'jotai';
import { FileText, Settings, Package, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { projectConfigAtom } from '@/store/atoms';

export function ConfigTab() {
  const [projectConfig] = useAtom(projectConfigAtom);
  const [selectedConfig, setSelectedConfig] = useState('package.json');

  // Mock project configurations
  const configs = {
    'package.json': {
      name: 'vite-react-typescript-starter',
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc -b && vite build',
        lint: 'eslint .',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        jotai: '^2.8.0'
      }
    },
    'vite.config.ts': {
      plugins: ['@vitejs/plugin-react'],
      resolve: {
        alias: {
          '@': './src'
        }
      },
      optimizeDeps: {
        exclude: ['lucide-react']
      }
    },
    'tsconfig.json': {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true
      }
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'vite':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'next':
        return <Package className="h-5 w-5 text-black dark:text-white" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPackageManagerIcon = (pm: string) => {
    const colors = {
      npm: 'text-red-600',
      yarn: 'text-blue-600',
      pnpm: 'text-yellow-600',
      bun: 'text-orange-600'
    };
    return colors[pm as keyof typeof colors] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Configuration</h2>
        <Badge variant="outline" className="flex items-center gap-2">
          {getProjectTypeIcon('vite')}
          Vite Project
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Project Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project Name</label>
              <p className="font-medium">vite-react-typescript-starter</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version</label>
              <p className="font-medium">0.0.0</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                {getProjectTypeIcon('vite')}
                Vite
              </Badge>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Package Manager</label>
              <Badge variant="outline" className={`flex items-center gap-1 w-fit ${getPackageManagerIcon('npm')}`}>
                <Package className="h-4 w-4" />
                npm
              </Badge>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">Dependencies</label>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">8 dev, 16 prod</p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Files */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuration Files</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedConfig} onValueChange={setSelectedConfig}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="package.json">package.json</TabsTrigger>
                <TabsTrigger value="vite.config.ts">vite.config.ts</TabsTrigger>
                <TabsTrigger value="tsconfig.json">tsconfig.json</TabsTrigger>
              </TabsList>

              {Object.entries(configs).map(([fileName, config]) => (
                <TabsContent key={fileName} value={fileName} className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{fileName}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Edit in VS Code
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[400px] w-full rounded-md border">
                    <pre className="p-4 text-sm">
                      <code>{JSON.stringify(config, null, 2)}</code>
                    </pre>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Open package.json
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Edit Vite Config
            </Button>
            <Button variant="outline" className="justify-start">
              <Package className="mr-2 h-4 w-4" />
              Update Dependencies
            </Button>
            <Button variant="outline" className="justify-start">
              <Zap className="mr-2 h-4 w-4" />
              Generate Types
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}