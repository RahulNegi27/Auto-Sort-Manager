import { useState, useEffect } from 'react';

export const useDashboard = () => {
  const [stats, setStats] = useState<any>({
    totalFiles: 2847,
    organizedFiles: 2019,
    organizationRate: 92,
    diskUsage: 0,
    diskUsageByType: {
      documents: 125,
      videos: 156,
      images: 99,
      audio: 34,
      other: 96
    }
  });
  const [systemUsage, setSystemUsage] = useState({
    cpu: 32,
    memory: 64,
    disk: 0,
    activeProcesses: 128,
    timestamp: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to get system usage from main process
        if ((window as any).electronAPI && (window as any).electronAPI.getSystemUsage) {
          const sys = await (window as any).electronAPI.getSystemUsage();
          if (!mounted) return;
          if (sys) {
            setSystemUsage((prev: any) => ({ ...prev, ...sys }));
            if (typeof sys.disk === 'number' && !Number.isNaN(sys.disk)) {
              setStats((prev: any) => ({ ...prev, diskUsage: Math.round(sys.disk) }));
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch system usage for dashboard', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return { stats, systemUsage, isLoading };
};
