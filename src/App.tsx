import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProcessManager } from './components/ProcessManager';
import { DiskUsage } from './pages/DiskUsage';
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics';

const CPU_THRESHOLD = 80;
const MEMORY_THRESHOLD = 90;

// Define a type for the onRouteChange prop
interface RouteChangeObserverProps {
  onRouteChange: (path: string) => void;
}

// Location observer component to detect route changes
function RouteChangeObserver({ onRouteChange }: RouteChangeObserverProps) {
  const location = useLocation();
  
  useEffect(() => {
    onRouteChange(location.pathname);
  }, [location, onRouteChange]);
  
  return null;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });
  
  const { 
    // metrics is not being used, so we can exclude it from destructuring
    isConnected, 
    processes, 
    requestProcesses, 
    notifyProcessKilled 
  } = usePerformanceMetrics();
  
  const handleRouteChange = (path: string) => {
    // Request processes data only when navigating to the processes page
    if (path === '/processes') {
      requestProcesses();
    }
  };

  const handleKillProcess = async (pid: number) => {
    try {
      const response = await fetch(`http://localhost:3000/process/${pid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to terminate process');
      }
      
      // Notify our hook about the killed process
      notifyProcessKilled(pid);
    } catch (error) {
      console.error('Error terminating process:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <BrowserRouter>
      <RouteChangeObserver onRouteChange={handleRouteChange} />
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Routes>
          <Route path="/" element={<Dashboard darkMode={darkMode} />} />
          <Route 
            path="/processes" 
            element={
              <ProcessManager
                processes={processes}
                onKillProcess={handleKillProcess}
                cpuThreshold={CPU_THRESHOLD}
                memoryThreshold={MEMORY_THRESHOLD}
                darkMode={darkMode}
              />
            } 
          />
          <Route path="/disk" element={<DiskUsage darkMode={darkMode} />} />
          <Route 
            path="/settings" 
            element={
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1E2433]' : 'bg-white'} shadow-lg`}>
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <button
                      onClick={toggleDarkMode}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode 
                          ? 'bg-[#252B3B] text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {darkMode ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isConnected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Process Monitor</span>
                    <button
                      onClick={requestProcesses}
                      className={`px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700`}
                    >
                      Refresh Processes
                    </button>
                  </div>
                </div>
              </div>
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;