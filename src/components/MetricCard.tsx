import { DivideIcon as LucideIcon } from 'lucide-react';
import { ComponentWithDarkMode } from '../types';

interface MetricCardProps extends ComponentWithDarkMode {
  icon: typeof LucideIcon;
  title: string;
  value: string;
}

export function MetricCard({ icon: Icon, title, value, darkMode }: MetricCardProps) {
  return (
    <div className={`rounded-lg shadow p-6 ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}