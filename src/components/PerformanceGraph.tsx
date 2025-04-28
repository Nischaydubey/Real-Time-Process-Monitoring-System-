import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SystemMetrics, ComponentWithDarkMode } from '../types';

interface PerformanceGraphProps extends ComponentWithDarkMode {
  data: SystemMetrics[];
}

export function PerformanceGraph({ data, darkMode }: PerformanceGraphProps) {
  const baseClasses = darkMode ? {
    container: 'bg-gray-800 text-white',
    title: 'text-white',
    chart: {
      backgroundColor: '#1f2937',
      textColor: '#ffffff'
    }
  } : {
    container: 'bg-white text-gray-900',
    title: 'text-gray-900',
    chart: {
      backgroundColor: '#ffffff',
      textColor: '#000000'
    }
  };

  return (
    <div className={`rounded-lg shadow p-6 mb-8 ${baseClasses.container}`}>
      <h2 className={`text-xl font-semibold mb-4 ${baseClasses.title}`}>System Performance</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
              label={{ value: "Time", position: "insideBottomRight", offset: -5 }}
              stroke={baseClasses.chart.textColor}
            />
            <YAxis 
              label={{ value: "Usage (%)", angle: -90, position: "insideLeft" }} 
              stroke={baseClasses.chart.textColor}
            />
            <Tooltip 
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              formatter={(value: number, name: string) => {
                if (name.includes("Usage")) {
                  return [`${value.toFixed(2)}%`, name];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: baseClasses.chart.backgroundColor,
                color: baseClasses.chart.textColor,
                border: 'none'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="memory.percentage" 
              stroke="#8884d8" 
              name="Memory Usage" 
              dot={false} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="cpu.averageUsage" 
              stroke="#82ca9d" 
              name="CPU Usage" 
              dot={false} 
              strokeWidth={2}
            />
            {data[0]?.gpu?.usage.map((_, index) => (
              <Line
                key={`gpu-${index}`}
                type="monotone"
                dataKey={`gpu.usage[${index}]`}
                stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`}
                name={`GPU ${index + 1} Usage`}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}