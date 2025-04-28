import { useState, useEffect } from 'react';
import { ProcessInfo, ComponentWithDarkMode } from '../types';
import { Search, AlertTriangle, Terminal, User, Clock, } from 'lucide-react';

interface ProcessManagerProps extends ComponentWithDarkMode {
  processes: ProcessInfo[];
  onKillProcess: (pid: number) => void;
  cpuThreshold: number;
  memoryThreshold: number;
}

export function ProcessManager({ processes, onKillProcess, cpuThreshold, memoryThreshold, darkMode }: ProcessManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ProcessInfo>('cpu');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);
  const [isTerminating, setIsTerminating] = useState<number | null>(null);

  // Clear selected process if it no longer exists in the list
  useEffect(() => {
    if (selectedProcess && !processes.some(p => p.pid === selectedProcess.pid)) {
      setSelectedProcess(null);
    }
  }, [processes, selectedProcess]);

  const baseClasses = darkMode ? {
    container: 'bg-gray-800 text-white',
    input: 'bg-gray-700 text-white border-gray-600',
    header: 'text-gray-300',
    row: 'hover:bg-gray-700',
    text: 'text-gray-100',
    button: 'text-red-400 hover:text-red-300',
    loadingText: 'text-gray-400'
  } : {
    container: 'bg-white text-gray-900',
    input: 'bg-white text-gray-900 border-gray-300',
    header: 'text-gray-500',
    row: 'hover:bg-gray-50',
    text: 'text-gray-900',
    button: 'text-red-600 hover:text-red-900',
    loadingText: 'text-gray-500'
  };

  const filteredProcesses = processes
    .filter(process => 
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.pid.toString().includes(searchTerm) ||
      process.user?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) {
        return 0;
      }

      return sortDirection === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

  const handleSort = (field: keyof ProcessInfo) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleKillProcess = (pid: number) => {
    setIsTerminating(pid);
    onKillProcess(pid);
    
    // Reset terminating state after a timeout (in case the server doesn't respond)
    setTimeout(() => {
      setIsTerminating(null);
    }, 5000);
  };

  const isProcessCritical = (process: ProcessInfo) => 
    process.cpu > cpuThreshold || process.memory > memoryThreshold;

  const formatStartTime = (startTime: number) => {
    const now = Date.now();
    const uptime = now - startTime;
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className={`rounded-lg shadow p-6 mb-8 ${baseClasses.container}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Process Manager</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search processes..."
              className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${baseClasses.input}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {processes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className={`text-lg mb-4 ${baseClasses.loadingText}`}>No processes data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {['pid', 'name', 'cpu', 'memory', 'user', 'status', 'started'].map((field) => (
                  <th 
                    key={field}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${baseClasses.header}`}
                    onClick={() => handleSort(field as keyof ProcessInfo)}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </th>
                ))}
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${baseClasses.header}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProcesses.map((process) => (
                <tr 
                  key={process.pid} 
                  className={`${isProcessCritical(process) ? darkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-50' : ''} ${baseClasses.row} cursor-pointer ${isTerminating === process.pid ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedProcess(selectedProcess?.pid === process.pid ? null : process)}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                    {process.pid}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text} flex items-center gap-2`}>
                    {process.name}
                    {isProcessCritical(process) && (
                      <AlertTriangle className="w-4 h-4 text-red-500" aria-label="High resource usage" />
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                    {process.cpu.toFixed(1)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                    {process.memory.toFixed(1)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                    {process.user || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      process.status === 'running' ? 'bg-green-100 text-green-800' :
                      process.status === 'sleeping' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {process.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                    {formatStartTime(process.started)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTerminating !== process.pid) {
                          handleKillProcess(process.pid);
                        }
                      }}
                      disabled={isTerminating === process.pid}
                      className={`font-medium ${baseClasses.button} ${isTerminating === process.pid ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {isTerminating === process.pid ? 'Terminating...' : 'Terminate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProcess && (
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h3 className="text-lg font-medium mb-2">Process Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-medium">Command:</span> {selectedProcess.command || 'N/A'}
              </p>
              <p className="flex items-center gap-2 mt-2">
                <User className="w-4 h-4" />
                <span className="font-medium">User:</span> {selectedProcess.user || 'N/A'}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Started:</span> {new Date(selectedProcess.started).toLocaleString()}
              </p>
              <p className="flex items-center gap-2 mt-2">
                <span className="font-medium">Path:</span> {selectedProcess.path || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleKillProcess(selectedProcess.pid)}
              disabled={isTerminating === selectedProcess.pid}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              } ${isTerminating === selectedProcess.pid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTerminating === selectedProcess.pid ? 'Terminating...' : 'Terminate Process'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}