import { useState } from 'react';
import { Code, ExternalLink, Settings, FileText, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EditorTab() {
  const [defaultEditor, setDefaultEditor] = useState('code');
  const [autoOpen, setAutoOpen] = useState(true);

  const editors = [
    {
      id: 'code',
      name: 'Visual Studio Code',
      command: 'code',
      icon: Code,
      description: 'Microsoft\'s popular code editor',
      installed: true
    },
    {
      id: 'cursor',
      name: 'Cursor',
      command: 'cursor',
      icon: ExternalLink,
      description: 'AI-powered code editor',
      installed: true
    },
    {
      id: 'webstorm',
      name: 'WebStorm',
      command: 'webstorm',
      icon: Settings,
      description: 'JetBrains IDE for web development',
      installed: false
    },
    {
      id: 'sublime',
      name: 'Sublime Text',
      command: 'subl',
      icon: FileText,
      description: 'Sophisticated text editor',
      installed: false
    }
  ];

  const recentFiles = [
    { name: 'App.tsx', path: 'src/App.tsx', lastOpened: '2 hours ago' },
    { name: 'package.json', path: 'package.json', lastOpened: '30 min ago' },
    { name: 'vite.config.ts', path: 'vite.config.ts', lastOpened: '1 hour ago' },
    { name: 'ScriptsTab.tsx', path: 'src/components/tabs/ScriptsTab.tsx', lastOpened: '15 min ago' }
  ];

  const handleOpenFile = (filePath: string, editor: string) => {
    // In a real implementation, this would execute the command
    console.log(`Opening ${filePath} with ${editor}`);
  };

  const handleOpenFolder = (editor: string) => {
    console.log(`Opening project folder with ${editor}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Editor Integration</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenFolder('code')} variant="outline">
            <Code className="mr-2 h-4 w-4" />
            Open in VS Code
          </Button>
          <Button onClick={() => handleOpenFolder('cursor')} variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Cursor
          </Button>
        </div>
      </div>

      {/* Editor Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Editor Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="default-editor">Default Editor</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred code editor</p>
            </div>
            <Select value={defaultEditor} onValueChange={setDefaultEditor}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editors.filter(e => e.installed).map((editor) => (
                  <SelectItem key={editor.id} value={editor.id}>
                    {editor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-open">Auto-open files</Label>
              <p className="text-sm text-muted-foreground">Automatically open files when clicked</p>
            </div>
            <Switch
              id="auto-open"
              checked={autoOpen}
              onCheckedChange={setAutoOpen}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Editors */}
      <Card>
        <CardHeader>
          <CardTitle>Available Editors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {editors.map((editor) => (
              <div
                key={editor.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <editor.icon className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{editor.name}</h4>
                      <Badge variant={editor.installed ? 'default' : 'secondary'}>
                        {editor.installed ? 'Installed' : 'Not Installed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{editor.description}</p>
                    <code className="text-xs bg-muted px-1 rounded">{editor.command}</code>
                  </div>
                </div>
                <div className="flex gap-2">
                  {editor.installed ? (
                    <Button
                      size="sm"
                      onClick={() => handleOpenFolder(editor.command)}
                    >
                      Open Project
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Install
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{file.lastOpened}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenFile(file.path, 'code')}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenFile(file.path, 'cursor')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleOpenFolder('code')}
            >
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Open Project in VS Code</p>
                  <p className="text-sm text-muted-foreground">Open entire project</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleOpenFolder('cursor')}
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Open Project in Cursor</p>
                  <p className="text-sm text-muted-foreground">AI-powered editing</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleOpenFile('package.json', defaultEditor)}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Edit package.json</p>
                  <p className="text-sm text-muted-foreground">Project configuration</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Open Terminal</p>
                  <p className="text-sm text-muted-foreground">Launch integrated terminal</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}