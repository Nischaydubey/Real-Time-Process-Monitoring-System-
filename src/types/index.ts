export interface SystemInfoData {
  cpu: {
    manufacturer: string;
    brand: string;
    physicalCores: number;
    cores: number;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    swapTotal: number;
    swapUsed: number;
    cacheMemory: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    arch: string;
  };
  gpu: Array<{
    model: string;
    vendor: string;
    vram: number;
    driver: string;
  }>;
}

export interface DiskInfo {
  device: string;
  type: string;
  total: number;
  used: number;
  free: number;
  percentage: number;
  mount: string;
}

export interface GpuInfo {
  name: string;
  vendor: string;
  type: 'integrated' | 'dedicated';
  memoryTotal: number;
  memoryUsed: number;
  memoryFree: number;
  temperature: number | null;
  usage: number;
  fanSpeed: number | null;
  clockCore: number | null;
  clockMemory: number | null;
}

export interface SystemMetrics {
  timestamp: number;
  bootTime: number;
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
    swap: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
  };
  cpu: {
    cores: number;
    threads: number;
    usage: number[];
    threadUsage: number[];
    averageUsage: number;
    temperature: number | null;
    speed: number;
  };
  gpu: {
    usage: number[];
    memory: number[];
    temperature: number[];
    fanSpeed: number[];
    clockCore: number[];
    clockMemory: number[];
  };
  loadAverage: number[];
  uptime: number;
  processes: ProcessInfo[];
  disk: DiskInfo[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  memoryRaw: number;
  status: string;
  started: number;
  user: string;
  command: string;
  path: string;
}

export interface NetworkRequest {
  url: string;
  duration: number;
  timestamp: number;
}

export interface AlertThresholds {
  cpu: number;
  memory: number;
  gpu: number;
}

export interface ComponentWithDarkMode {
  darkMode: boolean;
}