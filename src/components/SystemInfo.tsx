import { SystemInfoData } from '../types';
import { Cpu, Server, MemoryStick as Memory, Cpu as Gpu } from 'lucide-react';

interface SystemInfoProps {
  info: SystemInfoData;
  darkMode: boolean;
}

export function SystemInfo({ info, darkMode }: SystemInfoProps) {
  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-[#1E2433]' : 'bg-white'} shadow-lg mb-6`}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Server className="w-5 h-5 text-indigo-500" />
        System Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <h3 className="font-medium">CPU</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Manufacturer:</span> {info.cpu.manufacturer}</p>
            <p><span className="text-gray-500">Model:</span> {info.cpu.brand}</p>
            <p><span className="text-gray-500">Cores:</span> {info.cpu.physicalCores} (Physical) / {info.cpu.cores} (Logical)</p>
            <p><span className="text-gray-500">Base Speed:</span> {info.cpu.speed} GHz</p>
          </div>
        </div>

        {/* Memory Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Memory className="w-4 h-4 text-indigo-500" />
            <h3 className="font-medium">Memory</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Total RAM:</span> {formatBytes(info.memory.total)}</p>
            <p><span className="text-gray-500">Used RAM:</span> {formatBytes(info.memory.used)}</p>
            <p><span className="text-gray-500">Cache Memory:</span> {formatBytes(info.memory.cacheMemory)}</p>
            <p><span className="text-gray-500">Swap:</span> {formatBytes(info.memory.swapUsed)} / {formatBytes(info.memory.swapTotal)}</p>
          </div>
        </div>

        {/* Operating System */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-indigo-500" />
            <h3 className="font-medium">Operating System</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Platform:</span> {info.os.platform}</p>
            <p><span className="text-gray-500">Distribution:</span> {info.os.distro}</p>
            <p><span className="text-gray-500">Release:</span> {info.os.release}</p>
            <p><span className="text-gray-500">Architecture:</span> {info.os.arch}</p>
          </div>
        </div>

        {/* GPU Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Gpu className="w-4 h-4 text-indigo-500" />
            <h3 className="font-medium">Graphics</h3>
          </div>
          <div className="space-y-3 text-sm">
            {info.gpu.map((gpu, index) => (
              <div key={index} className="space-y-1">
                <p><span className="text-gray-500">Model:</span> {gpu.model}</p>
                <p><span className="text-gray-500">Vendor:</span> {gpu.vendor}</p>
                <p><span className="text-gray-500">VRAM:</span> {gpu.vram} MB</p>
                <p><span className="text-gray-500">Driver:</span> {gpu.driver}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}