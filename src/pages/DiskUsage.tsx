import { HardDrive } from 'lucide-react';
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface DiskUsageProps {
  darkMode: boolean;
}

export function DiskUsage({ darkMode }: DiskUsageProps) {
  const { metrics } = usePerformanceMetrics();
  const latestMetrics = metrics[metrics.length - 1];

  if (!latestMetrics?.disk?.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Loading disk information...
        </p>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Disk Usage
      </h2>
      
      <div className="grid grid-cols-1 gap-6">
        {latestMetrics.disk.map((disk, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl ${
              darkMode ? 'bg-[#1E2433]' : 'bg-white'
            } shadow-lg`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-[#252B3B]' : 'bg-gray-100'
              }`}>
                <HardDrive className="w-6 h-6 text-indigo-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{disk.mount}</h3>
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {disk.type}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {formatBytes(disk.used)} used of {formatBytes(disk.total)}
                      </span>
                      <span className={`font-medium ${
                        disk.percentage > 90 ? 'text-red-500' :
                        disk.percentage > 70 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {disk.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          disk.percentage > 90 ? 'bg-red-500' :
                          disk.percentage > 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${disk.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total
                      </p>
                      <p className="font-medium">{formatBytes(disk.total)}</p>
                    </div>
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Used
                      </p>
                      <p className="font-medium">{formatBytes(disk.used)}</p>
                    </div>
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Free
                      </p>
                      <p className="font-medium">{formatBytes(disk.free)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}