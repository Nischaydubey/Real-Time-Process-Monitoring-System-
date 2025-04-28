import { ComponentWithDarkMode } from '../types';

export function Header({ darkMode }: ComponentWithDarkMode) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-4">
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop" 
          alt="System Monitor" 
          className="w-12 h-12 rounded-lg"
        />
        <h1 className={`text-3xl font-bold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          System Performance Dashboard
        </h1>
      </div>
    </header>
  );
}