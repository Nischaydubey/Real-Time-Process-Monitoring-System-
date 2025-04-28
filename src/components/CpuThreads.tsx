import { Bar } from 'recharts';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CpuThreadsProps {
  threads: number[];
  darkMode: boolean;
}

export function CpuThreads({ threads, darkMode }: CpuThreadsProps) {
  const data = threads.map((usage, index) => ({
    thread: `CPU ${index + 1}`,
    usage: usage
  }));

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1E2433]' : 'bg-white'} shadow-lg`}>
      <h3 className="text-lg font-semibold mb-4">CPU Threads Usage</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#252B3B' : '#f3f4f6'} />
            <XAxis 
              dataKey="thread" 
              stroke={darkMode ? '#9CA3AF' : '#4B5563'}
              tick={{ fill: darkMode ? '#9CA3AF' : '#4B5563' }}
            />
            <YAxis 
              stroke={darkMode ? '#9CA3AF' : '#4B5563'}
              tick={{ fill: darkMode ? '#9CA3AF' : '#4B5563' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#252B3B' : 'white',
                border: 'none',
                borderRadius: '8px',
                color: darkMode ? 'white' : 'black'
              }}
            />
            <Bar 
              dataKey="usage" 
              fill="#8B5CF6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}