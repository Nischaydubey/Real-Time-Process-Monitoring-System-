import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import os from 'os';
import si from 'systeminformation';
import cors from 'cors';

const app = express();
const METRIC_INTERVAL = 2000; // Increased to 2 seconds to reduce CPU load
const PROCESS_LIMIT = 10;
const CACHE_DURATION = 1000; // Increased cache duration to 1 second

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  pingTimeout: 30000, 
  pingInterval: 10000, 
  transports: ['websocket'], 
  allowUpgrades: false, 
  maxHttpBufferSize: 1e6 
});

let processCache = null;
let processCacheTime = 0;
let metricsCache = null;
let metricsCacheTime = 0;
let activeConnections = new Set();
let processesRequested = false;
const PROCESS_CACHE_DURATION = 30000; // 30 seconds process cache to reduce load

// Lightweight process check
async function isProcessRunning(pid) {
  try {
    return process.kill(pid, 0);
  } catch (e) {
    return e.code === 'EPERM';
  }
}

async function getSystemInfo() {
  try {
    const [cpu, mem, osInfo, graphics, cpuTemp] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.graphics(),
      si.cpuTemperature()
    ]);

    return {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        physicalCores: cpu.physicalCores,
        cores: cpu.cores,
        speed: cpu.speed,
        temperature: cpuTemp.main || null
      },
      memory: {
        total: mem.total,
        free: mem.available,
        used: mem.active,
        swapTotal: mem.swaptotal,
        swapUsed: mem.swapused,
        cacheMemory: mem.cached
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        kernel: osInfo.kernel,
        arch: osInfo.arch
      },
      gpu: graphics.controllers.map(controller => ({
        model: controller.model,
        vendor: controller.vendor,
        vram: controller.vram,
        driver: controller.driver
      }))
    };
  } catch (error) {
    console.error('Error getting system information:', error);
    return null;
  }
}

async function getProcesses(forceRefresh = false) {
  const now = Date.now();
  
  // Return cached processes if available and not forced to refresh
  if (!forceRefresh && processCache && (now - processCacheTime) < PROCESS_CACHE_DURATION) {
    return processCache;
  }

  try {
    const processes = await si.processes();
    const users = await si.users();
    const totalMem = os.totalmem();
    const userMap = new Map(users.map(user => [user.pid, user.user]));

    const filteredProcesses = processes.list
      .filter(process => process.cpu > 0.1 || process.memRss > totalMem * 0.001) // Filter out very low resource processes
      .map(process => ({
        pid: process.pid,
        name: process.name,
        cpu: Math.min(process.cpu || 0, 100),
        memory: process.memRss ? Math.min((process.memRss / totalMem) * 100, 100) : 0,
        memoryRaw: process.memRss || 0,
        status: process.state || 'unknown',
        started: process.started,
        user: userMap.get(process.pid) || process.user || 'system',
        command: process.command || '',
        path: process.path || ''
      }))
      .sort((a, b) => b.cpu - a.cpu || b.memory - a.memory)
      .slice(0, PROCESS_LIMIT); // Take top resource-consuming processes
      
    processCache = filteredProcesses;
    processCacheTime = now;
    processesRequested = false;
    
    return filteredProcesses;
  } catch (error) {
    console.error('Error getting process list:', error);
    return processCache || [];
  }
}

async function getMetrics(force = false) {
  const now = Date.now();
  
  if (!force && metricsCache && (now - metricsCacheTime) < CACHE_DURATION) {
    return metricsCache;
  }

  try {
    const [currentLoad, memory, fsSize, time, cpuTemp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.time(),
      si.cpuTemperature()
    ]);

    // For regular metrics, use a placeholder for processes to avoid load
    // Real process data will be sent separately when requested
    const processes = [];

    const metrics = {
      timestamp: now,
      bootTime: time.boottime * 1000,
      memory: {
        total: memory.total,
        free: memory.available,
        used: memory.active,
        percentage: Math.min((memory.active / memory.total) * 100, 100),
        swap: {
          total: memory.swaptotal,
          used: memory.swapused,
          free: memory.swapfree,
          percentage: memory.swaptotal ? 
            Math.min((memory.swapused / memory.swaptotal) * 100, 100) : 0
        }
      },
      cpu: {
        cores: os.cpus().length,
        threads: os.cpus().length,
        usage: currentLoad.cpus.map(cpu => Math.min(cpu.load, 100)),
        threadUsage: currentLoad.cpus.map(cpu => Math.min(cpu.load, 100)),
        averageUsage: Math.min(currentLoad.currentLoad, 100),
        temperature: cpuTemp.main || null,
        speed: os.cpus()[0].speed
      },
      loadAverage: os.loadavg(),
      uptime: os.uptime(),
      processes,
      disk: fsSize
        .filter(fs => fs.size > 0)
        .map(fs => ({
          device: fs.fs,
          type: fs.type,
          total: fs.size,
          used: fs.used,
          free: fs.size - fs.used,
          percentage: Math.min((fs.used / fs.size) * 100, 100),
          mount: fs.mount
        }))
    };

    metricsCache = metrics;
    metricsCacheTime = now;
    return metrics;
  } catch (error) {
    console.error('Error getting metrics:', error);
    return metricsCache || null;
  }
}

io.on('connection', async (socket) => {
  console.log('Client connected');
  activeConnections.add(socket.id);
  let metricsInterval;

  try {
    const sysInfo = await getSystemInfo();
    if (sysInfo) {
      socket.emit('systemInfo', sysInfo);
    }

    const initialMetrics = await getMetrics(true);
    if (initialMetrics) {
      socket.emit('metrics', initialMetrics);
    }

    metricsInterval = setInterval(async () => {
      if (socket.connected && activeConnections.has(socket.id)) {
        const metrics = await getMetrics();
        if (metrics) {
          socket.emit('metrics', metrics);
        }
      }
    }, METRIC_INTERVAL);

    // Handle process data requests
    socket.on('requestProcesses', async () => {
      if (!processesRequested) {
        processesRequested = true;
        const processes = await getProcesses(true);
        socket.emit('processData', processes);
      } else {
        // If processes were already requested, send the cached version
        socket.emit('processData', processCache || []);
      }
    });

    // Handle process kill notification
    socket.on('processKilled', async (pid) => {
      console.log(`Process killed: ${pid}`);
      processesRequested = false; // Reset the flag to allow refresh
      const processes = await getProcesses(true);
      io.emit('processData', processes); // Broadcast to all clients
    });

  } catch (error) {
    console.error('Error in socket connection:', error);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    activeConnections.delete(socket.id);
    if (metricsInterval) {
      clearInterval(metricsInterval);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    activeConnections.delete(socket.id);
    if (metricsInterval) {
      clearInterval(metricsInterval);
    }
  });
});

app.delete('/process/:pid', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pid = parseInt(req.params.pid);
  if (isNaN(pid)) {
    return res.status(400).json({ error: 'Invalid PID' });
  }

  try {
    // Check if process exists
    const running = await isProcessRunning(pid);
    if (!running) {
      return res.status(404).json({ error: 'Process not found' });
    }

    // Try SIGTERM first
    process.kill(pid, 'SIGTERM');

    // Wait for process to terminate gracefully
    setTimeout(async () => {
      try {
        const stillRunning = await isProcessRunning(pid);
        if (stillRunning) {
          // Force kill if still running
          process.kill(pid, 'SIGKILL');
        }
      } catch (e) {
        // Process already terminated
      }
      
      // Reset process request flag to allow refreshing the list
      processesRequested = false;
      
      // Refresh the process cache
      await getProcesses(true);
      
      // Notify all clients that a process was killed
      io.emit('processKilled', pid);
    }, 1000);

    res.json({ success: true });
  } catch (error) {
    if (error.code === 'EPERM') {
      return res.status(403).json({ error: 'Permission denied to terminate process' });
    }
    console.error('Error terminating process:', error);
    res.status(500).json({ error: 'Failed to terminate process' });
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});