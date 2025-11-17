import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

interface DiskRequest {
  id: string;
  track: number;
  arrival: number;
  serviced?: boolean;
  serviceTime?: number;
}

type SchedulingAlgorithm = 'FCFS' | 'SSTF' | 'SCAN' | 'C-SCAN';

export const DiskScheduler: React.FC<{ autoRun?: boolean }> = ({ autoRun }) => {
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('FCFS');
  const [diskRequests, setDiskRequests] = useState<DiskRequest[]>([
    { id: 'r1', track: 10,  arrival: 0 },
    { id: 'r2', track: 40,  arrival: 1 },
    { id: 'r3', track: 150, arrival: 2 },
    { id: 'r4', track: 90,  arrival: 3 },
    { id: 'r5', track: 180, arrival: 4 },
    // You can add many requests to stress-test algorithms.
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [serviceOrder, setServiceOrder] = useState<string[]>([]);
  const [totalSeekTime, setTotalSeekTime] = useState(0);
  const [scheduleTimeline, setScheduleTimeline] = useState<Array<{ id: string; start: number; duration: number; track: number }>>([]);

  // Interactive controls for disk requests
  const [newReqTrack, setNewReqTrack] = useState(50);
  const [newReqArrival, setNewReqArrival] = useState(0);
  const addDiskRequest = () => {
    const id = `r_${Date.now().toString(36)}_${Math.floor(Math.random()*1000)}`;
    setDiskRequests(prev => [...prev, { id, track: Number(newReqTrack), arrival: Number(newReqArrival) }]);
  };

  const removeDiskRequest = (id: string) => {
    setDiskRequests(prev => prev.filter(r => r.id !== id));
  };

  const scheduleRequests = () => {
    const requests = [...diskRequests];
    let order: string[] = [];
    let currentPos = 0;
    let seekTime = 0;
    const timeline: Array<{ id: string; start: number; duration: number; track: number }> = [];
    let currentTime = 0;

    if (algorithm === 'FCFS') {
      // First Come First Served
      order = requests.map((r, i) => {
        const seek = Math.abs(r.track - currentPos);
        seekTime += seek;
        // record timeline segment
        timeline.push({ id: r.id, start: currentTime, duration: Math.max(1, seek), track: r.track });
        currentTime += Math.max(1, seek);
        currentPos = r.track;
        return r.id;
      });
    } else if (algorithm === 'SSTF') {
      // Shortest Seek Time First
      const remaining = [...requests];
      currentPos = 0;

      while (remaining.length > 0) {
        let nearestIdx = 0;
        let minSeek = Math.abs(remaining[0].track - currentPos);

        for (let i = 1; i < remaining.length; i++) {
          const seek = Math.abs(remaining[i].track - currentPos);
          if (seek < minSeek) {
            minSeek = seek;
            nearestIdx = i;
          }
        }

        const nearest = remaining[nearestIdx];
        order.push(nearest.id);
        seekTime += minSeek;
        // timeline segment
        timeline.push({ id: nearest.id, start: currentTime, duration: Math.max(1, minSeek), track: nearest.track });
        currentTime += Math.max(1, minSeek);
        currentPos = nearest.track;
        remaining.splice(nearestIdx, 1);
      }
    } else if (algorithm === 'SCAN') {
      // SCAN (Elevator Algorithm)
      const remaining = [...requests].sort((a, b) => a.track - b.track);
      currentPos = 0;
      let direction = 1; // 1 for up, -1 for down

      while (remaining.length > 0) {
        if (direction === 1) {
          // Moving towards end (199)
          const nextIdx = remaining.findIndex(r => r.track >= currentPos);
          if (nextIdx === -1) {
            // Change direction
            direction = -1;
            currentPos = 199;
          } else {
            const next = remaining[nextIdx];
            const s = Math.abs(next.track - currentPos);
            seekTime += s;
            timeline.push({ id: next.id, start: currentTime, duration: Math.max(1, s), track: next.track });
            currentTime += Math.max(1, s);
            currentPos = next.track;
            order.push(next.id);
            remaining.splice(nextIdx, 1);
          }
        } else {
          // Moving towards start (0)
          const nextIdx = remaining.findIndex(r => r.track <= currentPos);
          if (nextIdx === -1) {
            // Change direction
            direction = 1;
            currentPos = 0;
          } else {
            const next = remaining[nextIdx];
            const s2 = Math.abs(next.track - currentPos);
            seekTime += s2;
            timeline.push({ id: next.id, start: currentTime, duration: Math.max(1, s2), track: next.track });
            currentTime += Math.max(1, s2);
            currentPos = next.track;
            order.push(next.id);
            remaining.splice(nextIdx, 1);
          }
        }
      }
    } else if (algorithm === 'C-SCAN') {
      // Circular SCAN
      const remaining = [...requests].sort((a, b) => a.track - b.track);
      currentPos = 0;
      seekTime = 199; // Move to end

      // Service requests in circular manner
      for (const req of remaining) {
        const s3 = Math.abs(req.track - currentPos);
        seekTime += s3;
        timeline.push({ id: req.id, start: currentTime, duration: Math.max(1, s3), track: req.track });
        currentTime += Math.max(1, s3);
        currentPos = req.track;
        order.push(req.id);
      }

      // Return to beginning
      seekTime += currentPos;
    }

    setServiceOrder(order);
    setTotalSeekTime(seekTime);
    // store timeline for Gantt
    setScheduleTimeline(timeline);
  };

  const handleSimulate = () => {
    setIsRunning(true);
    scheduleRequests();
    setTimeout(() => setIsRunning(false), 2000);
  };

  // Auto-run when requested
  React.useEffect(() => {
    if (autoRun) {
      handleSimulate();
    }
  }, [autoRun]);

  const getRequestPosition = (track: number) => {
    return (track / 200) * 100;
  };

  const isServicedRequest = (id: string) => {
    return serviceOrder.includes(id);
  };

  const serviceIndex = (id: string) => {
    return serviceOrder.indexOf(id) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Scheduling Algorithm</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['FCFS', 'SSTF', 'SCAN', 'C-SCAN'] as SchedulingAlgorithm[]).map((algo) => (
            <button
              key={algo}
              onClick={() => {
                setAlgorithm(algo);
                setServiceOrder([]);
                setTotalSeekTime(0);
              }}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                algorithm === algo
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          {algorithm === 'FCFS' && 'Services requests in arrival order.'}
          {algorithm === 'SSTF' && 'Services request with shortest seek time first.'}
          {algorithm === 'SCAN' && 'Moves disk head in one direction, services all, then reverses.'}
          {algorithm === 'C-SCAN' && 'Like SCAN but always returns to start, providing uniform service.'}
        </p>
      </div>

      {/* Simulation Control */}
      <button
        onClick={handleSimulate}
        disabled={isRunning}
        className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isRunning ? 'Simulating...' : 'Run Simulation'}
      </button>

      {/* Disk Head Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Disk Track Visualization</h3>
        <div className="space-y-4">
          {/* Track representation */}
          <div className="relative h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-300">
            {/* Track scale */}
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full h-1 bg-gray-400 relative">
                {/* Start and end markers */}
                <div className="absolute left-0 top-0 -translate-y-1/2 w-0.5 h-3 bg-gray-600" />
                <div className="absolute right-0 top-0 -translate-y-1/2 w-0.5 h-3 bg-gray-600" />
              </div>
            </div>

            {/* Requests on track */}
            {diskRequests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                  isServicedRequest(req.id)
                    ? 'bg-green-400 border-green-600 text-white'
                    : 'bg-blue-400 border-blue-600 text-white'
                }`}
                style={{ left: `calc(${getRequestPosition(req.track)}% - 12px)` }}
                title={`Track ${req.track}`}
              >
                {isServicedRequest(req.id) ? serviceIndex(req.id) : ''}
              </motion.div>
            ))}

            {/* Disk head position */}
            {serviceOrder.length > 0 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-red-500 opacity-70"
                style={{
                  left: `calc(${getRequestPosition(
                    serviceOrder.length > 0
                      ? diskRequests.find(r => r.id === serviceOrder[Math.min(serviceOrder.length - 1, serviceOrder.length - 1)])?.track || 0
                      : 0
                  )}%)`
                }}
              />
            )}
          </div>

          {/* Track labels */}
          <div className="flex justify-between text-xs text-gray-600 font-mono">
            <span>Track 0</span>
            <span>Track 100</span>
            <span>Track 199</span>
          </div>
        </div>
      </div>

      {/* Editor: add/remove requests */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Edit Requests</h3>
        <div className="flex gap-2 mb-3">
          <input type="number" className="p-2 border rounded w-32" value={newReqTrack} onChange={e => setNewReqTrack(Number(e.target.value))} />
          <input type="number" className="p-2 border rounded w-32" value={newReqArrival} onChange={e => setNewReqArrival(Number(e.target.value))} />
          <button className="px-3 py-2 bg-primary-500 text-white rounded" onClick={addDiskRequest}>Add Request</button>
        </div>

        <div className="space-y-2">
          {diskRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="text-sm">{req.id} — Track {req.track} (arrival {req.arrival})</div>
              <button className="text-sm text-red-600" onClick={() => removeDiskRequest(req.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Service Queue */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Service Order</h3>
        {serviceOrder.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {serviceOrder.map((id, idx) => {
              const req = diskRequests.find(r => r.id === id);
              return (
                <motion.div
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-primary-50 border-2 border-primary-500 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <span className="font-bold text-primary-600">{idx + 1}</span>
                  <span className="text-sm text-gray-700">{id} (T{req?.track})</span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Run simulation to see service order</p>
        )}
      </div>

      {/* Gantt Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Gantt Chart (seek timeline)</h3>
        {scheduleTimeline.length === 0 ? (
          <p className="text-sm text-gray-500">Run a simulation to populate the seek timeline.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-24 font-medium">Sequence</div>
                <div className="flex-1 relative" style={{ height: 48 }}>
                  {scheduleTimeline.map((seg, idx) => {
                    const total = scheduleTimeline.reduce((a, b) => a + b.duration, 0) || 1;
                    const left = (seg.start / total) * 100;
                    const width = (seg.duration / total) * 100;
                    return (
                      <div key={idx} className="absolute top-2 h-10" style={{ left: `${left}%`, width: `${width}%` }}>
                        <div className="h-10 rounded-md flex items-center justify-center text-xs text-white" style={{ background: '#3b82f6' }}>
                          {seg.id} (T{seg.track})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">Total time: {scheduleTimeline.reduce((a, b) => a + b.duration, 0)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-2xl font-bold text-blue-600">{diskRequests.length}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Seek Time</p>
          <p className="text-2xl font-bold text-purple-600">{totalSeekTime}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Seek Time</p>
          <p className="text-2xl font-bold text-green-600">
            {diskRequests.length > 0 ? (totalSeekTime / diskRequests.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Request Queue */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Request Queue</h3>
        <div className="space-y-2">
          {diskRequests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isServicedRequest(req.id)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  isServicedRequest(req.id) ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {isServicedRequest(req.id) ? serviceIndex(req.id) : '-'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{req.id}</p>
                  <p className="text-sm text-gray-600">Track {req.track}</p>
                </div>
              </div>
              {isServicedRequest(req.id) && (
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                  Serviced
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add scheduleTimeline state setter near top of file
