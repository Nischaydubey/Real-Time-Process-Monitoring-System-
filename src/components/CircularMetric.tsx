import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CircularMetricProps {
  value: number;
  maxValue: number;
  title: string;
  subtitle?: string;
  color: string;
  darkMode: boolean;
}

export function CircularMetric({ value, maxValue, title, subtitle, color, darkMode }: CircularMetricProps) {
  const percentage = (value / maxValue) * 100;
  const formattedValue = value.toFixed(1);
  const formattedMax = maxValue.toFixed(1);

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1E2433]' : 'bg-white'} shadow-lg`}>
      <div className="w-32 h-32 mx-auto mb-4">
        <CircularProgressbar
          value={percentage}
          text={`${percentage.toFixed(1)}%`}
          styles={buildStyles({
            pathColor: color,
            textColor: darkMode ? 'white' : '#1A1F2E',
            trailColor: darkMode ? '#252B3B' : '#f3f4f6',
          })}
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {subtitle && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        )}
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {formattedValue} / {formattedMax} {maxValue >= 1024 ? 'GB' : '%'}
        </p>
      </div>
    </div>
  );
}