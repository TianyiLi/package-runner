import { Activity, Cpu, HardDrive, MemoryStick, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MonitoringTab() {
  // Mock monitoring data
  const systemStats = {
    cpu: 45,
    memory: 68,
    disk: 32,
    network: 15
  };

  const processes = [
    { name: 'vite', pid: 1234, cpu: 12.5, memory: 150, status: 'running' },
    { name: 'node', pid: 5678, cpu: 8.2, memory: 95, status: 'running' },
    { name: 'eslint', pid: 9012, cpu: 2.1, memory: 45, status: 'idle' },
  ];

  const logs = [
    { time: '14:32:15', level: 'info', message: 'Development server started on port 5173' },
    { time: '14:32:10', level: 'info', message: 'Building for production...' },
    { time: '14:31:58', level: 'warn', message: 'Unused dependency detected: lodash' },
    { time: '14:31:45', level: 'error', message: 'TypeScript error in App.tsx:15' },
    { time: '14:31:30', level: 'info', message: 'Hot module replacement enabled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Monitoring</h2>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          System Online
        </Badge>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              <span className="font-medium">CPU</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{systemStats.cpu}%</span>
                <span className="text-sm text-muted-foreground">Normal</span>
              </div>
              <Progress value={systemStats.cpu} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5 text-green-500" />
              <span className="font-medium">Memory</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{systemStats.memory}%</span>
                <span className="text-sm text-muted-foreground">4.2/8.0 GB</span>
              </div>
              <Progress value={systemStats.memory} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Disk</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{systemStats.disk}%</span>
                <span className="text-sm text-muted-foreground">156/500 GB</span>
              </div>
              <Progress value={systemStats.disk} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Network</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{systemStats.network}%</span>
                <span className="text-sm text-muted-foreground">12 MB/s</span>
              </div>
              <Progress value={systemStats.network} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Running Processes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Active Processes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processes.map((process) => (
                <div key={process.pid} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(process.status)}`}></div>
                    <div>
                      <p className="font-medium">{process.name}</p>
                      <p className="text-sm text-muted-foreground">PID: {process.pid}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{process.cpu}% CPU</p>
                    <p className="text-sm text-muted-foreground">{process.memory} MB</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.time}
                    </span>
                    <Badge variant="outline" className={`text-xs ${getLevelColor(log.level)}`}>
                      {log.level}
                    </Badge>
                    <span className="text-sm flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-500">98.7%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-500">245ms</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-500">1.2GB</p>
              <p className="text-sm text-muted-foreground">Data Processed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}