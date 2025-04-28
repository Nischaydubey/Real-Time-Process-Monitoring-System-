import { CircularMetric } from '../components/CircularMetric';
import { CpuThreads } from '../components/CpuThreads';
import { PerformanceGraph } from '../components/PerformanceGraph';
import { SystemInfo } from '../components/SystemInfo';
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  darkMode: boolean;
}

export function Dashboard({ darkMode }: DashboardProps) {
  const { metrics, systemInfo, isConnected } = usePerformanceMetrics();
  const latestMetrics = metrics[metrics.length - 1];

  if (!latestMetrics || !systemInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Loading system metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System Information */}
      <SystemInfo info={systemInfo} darkMode={darkMode} />

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CircularMetric
          value={latestMetrics.cpu.averageUsage}
          maxValue={100}
          title="CPU Usage"
          subtitle={`${systemInfo.cpu.cores} Cores @ ${systemInfo.cpu.speed}GHz`}
          color="#EF4444"
          darkMode={darkMode}
        />
        <CircularMetric
          value={latestMetrics.memory.percentage}
          maxValue={100}
          title="Memory Usage"
          subtitle={`${(systemInfo.memory.total / (1024 * 1024 * 1024)).toFixed(1)} GB RAM`}
          color="#06B6D4"
          darkMode={darkMode}
        />
        <CircularMetric
          value={latestMetrics.memory.swap.percentage}
          maxValue={100}
          title="Swap Usage"
          subtitle={`${(systemInfo.memory.swapTotal / (1024 * 1024 * 1024)).toFixed(1)} GB Swap`}
          color="#3B82F6"
          darkMode={darkMode}
        />
        <CircularMetric
          value={latestMetrics.disk[0]?.percentage || 0}
          maxValue={100}
          title="Disk Usage"
          subtitle={latestMetrics.disk[0]?.mount || 'N/A'}
          color="#8B5CF6"
          darkMode={darkMode}
        />
      </div>

      {/* Performance Graphs */}
      <div className="grid grid-cols-1 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1E2433]' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">CPU & Memory Usage Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
                  stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                />
                <YAxis 
                  stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#252B3B' : 'white',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Area
                  type="monotone"
                  dataKey="cpu.averageUsage"
                  stroke="#EF4444"
                  fill="#EF444433"
                  name="CPU Usage"
                />
                <Area
                  type="monotone"
                  dataKey="memory.percentage"
                  stroke="#06B6D4"
                  fill="#06B6D433"
                  name="Memory Usage"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <CpuThreads
          threads={latestMetrics.cpu.threadUsage}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}