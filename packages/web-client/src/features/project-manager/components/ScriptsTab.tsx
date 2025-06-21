import { useState } from 'react';
import { Play, Square, Settings, Plus, Terminal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectScripts } from '../hooks/useProjectScripts';

export function ScriptsTab() {
  const {
    currentScripts,
    selectedRepo,
    runningScripts,
    initializeScripts,
    runScript,
    stopScript,
    getScriptTypeIcon
  } = useProjectScripts();
  
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [scriptArgs, setScriptArgs] = useState<string>('');
  const [packageManager, setPackageManager] = useState<string>('npm');

  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">未選擇倉庫</p>
      </div>
    );
  }

  // Initialize scripts on component mount
  if (currentScripts.length === 0 && selectedRepo.packageJson?.scripts && Object.keys(selectedRepo.packageJson.scripts).length > 0) {
    initializeScripts();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">套件腳本</h2>
          <p className="text-muted-foreground">
            管理和執行 <span className="font-medium">{selectedRepo.name}</span> 的腳本
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                新增腳本
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增腳本</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="script-name">腳本名稱</Label>
                  <Input id="script-name" placeholder="例如：test" />
                </div>
                <div>
                  <Label htmlFor="script-command">指令</Label>
                  <Textarea id="script-command" placeholder="例如：npm test" />
                </div>
                <Button className="w-full">新增腳本</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button>
            <Terminal className="mr-2 h-4 w-4" />
            開啟終端
          </Button>
        </div>
      </div>

      {/* Running Scripts Alert */}
      {runningScripts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {runningScripts.length} 個腳本正在執行
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {runningScripts.map(script => (
                <Badge key={script.name} variant="outline" className="bg-background">
                  {script.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Available Scripts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                可用腳本
              </span>
              <Badge variant="secondary">{currentScripts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {currentScripts.map((script) => (
                  <div
                    key={script.name}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getScriptTypeIcon(script.name)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{script.name}</h4>
                            <Badge variant={script.isRunning ? 'default' : 'secondary'}>
                              {script.isRunning ? '執行中' : '閒置'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {script.command}
                          </p>
                        </div>
                      </div>
                      {script.lastRun && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          上次執行：{script.lastRun.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {script.isRunning ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => stopScript(script.name)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => runScript(script.name)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Script Runner */}
        <Card>
          <CardHeader>
            <CardTitle>腳本執行器</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="script-select">選擇腳本</Label>
              <Select value={selectedScript} onValueChange={setSelectedScript}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇要執行的腳本" />
                </SelectTrigger>
                <SelectContent>
                  {currentScripts.map((script) => (
                    <SelectItem key={script.name} value={script.name}>
                      <div className="flex items-center gap-2">
                        <span>{getScriptTypeIcon(script.name)}</span>
                        <span>{script.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="script-args">參數</Label>
              <Input
                id="script-args"
                placeholder="--flag value"
                value={scriptArgs}
                onChange={(e) => setScriptArgs(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="package-manager">套件管理器</Label>
              <Select value={packageManager} onValueChange={setPackageManager}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="npm">npm</SelectItem>
                  <SelectItem value="yarn">yarn</SelectItem>
                  <SelectItem value="pnpm">pnpm</SelectItem>
                  <SelectItem value="bun">bun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <Button 
              className="w-full" 
              disabled={!selectedScript}
              onClick={() => selectedScript && runScript(selectedScript)}
            >
              <Play className="mr-2 h-4 w-4" />
              執行腳本
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 