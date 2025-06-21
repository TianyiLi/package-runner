import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Activity, Cpu, HardDrive, Zap, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { selectedRepositoryAtom } from '@/store/atoms';
import type { MonitoringData } from '../types';

export function MonitoringTab() {
  const [selectedRepo] = useAtom(selectedRepositoryAtom);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [diskUsage, setDiskUsage] = useState(0);
  const [networkActivity, setNetworkActivity] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Simulate real-time monitoring data
  useEffect(() => {
    if (!isMonitoring || !selectedRepo) return;

    const interval = setInterval(() => {
      const cpu = Math.random() * 100;
      const memory = Math.random() * 100;
      const disk = Math.random() * 100;
      const network = Math.random() * 100;

      setCpuUsage(cpu);
      setMemoryUsage(memory);
      setDiskUsage(disk);
      setNetworkActivity(network);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, selectedRepo]);

  // Start monitoring when component mounts
  useEffect(() => {
    setIsMonitoring(true);
    return () => setIsMonitoring(false);
  }, []);

  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">未選擇倉庫</p>
      </div>
    );
  }

  const getStatusColor = (value: number) => {
    if (value < 30) return 'text-green-600';
    if (value < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (value: number) => {
    if (value < 30) return <Badge variant="outline" className="text-green-600">良好</Badge>;
    if (value < 70) return <Badge variant="outline" className="text-yellow-600">注意</Badge>;
    return <Badge variant="destructive">警告</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">系統監控</h2>
          <p className="text-muted-foreground">
            監控 <span className="font-medium">{selectedRepo.name}</span> 的系統資源使用狀況
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">即時監控中</span>
        </div>
      </div>

      {/* Resource Usage Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU 使用率</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(cpuUsage)}>
                {cpuUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={cpuUsage} className="mt-2" />
            <div className="mt-2 flex items-center justify-between">
              {getStatusBadge(cpuUsage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">記憶體使用率</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(memoryUsage)}>
                {memoryUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={memoryUsage} className="mt-2" />
            <div className="mt-2 flex items-center justify-between">
              {getStatusBadge(memoryUsage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">磁碟使用率</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(diskUsage)}>
                {diskUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={diskUsage} className="mt-2" />
            <div className="mt-2 flex items-center justify-between">
              {getStatusBadge(diskUsage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">網路活動</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(networkActivity)}>
                {networkActivity.toFixed(1)}%
              </span>
            </div>
            <Progress value={networkActivity} className="mt-2" />
            <div className="mt-2 flex items-center justify-between">
              {getStatusBadge(networkActivity)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process List */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              執行中的程序
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {[
                  { name: 'npm run dev', cpu: 25.3, memory: 180.2, status: 'running' },
                  { name: 'webpack-dev-server', cpu: 15.7, memory: 120.5, status: 'running' },
                  { name: 'typescript compiler', cpu: 8.2, memory: 85.3, status: 'running' },
                  { name: 'eslint worker', cpu: 5.1, memory: 45.8, status: 'idle' }
                ].map((process, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{process.name}</span>
                        <Badge variant={process.status === 'running' ? 'default' : 'secondary'}>
                          {process.status === 'running' ? '執行中' : '閒置'}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>CPU: {process.cpu}%</span>
                        <span>記憶體: {process.memory}MB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              系統警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {[
                  {
                    type: 'warning',
                    message: 'CPU 使用率超過 80%',
                    time: '2 分鐘前',
                    severity: 'medium'
                  },
                  {
                    type: 'info',
                    message: '自動儲存已啟用',
                    time: '5 分鐘前',
                    severity: 'low'
                  },
                  {
                    type: 'error',
                    message: '記憶體不足警告',
                    time: '10 分鐘前',
                    severity: 'high'
                  }
                ].map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 