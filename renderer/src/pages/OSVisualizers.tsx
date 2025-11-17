import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { DeadlockVisualizer } from '../components/os-visualizers/DeadlockVisualizer';
import { DiskScheduler } from '../components/os-visualizers/DiskScheduler';
import { Activity, HardDrive } from 'lucide-react';

export const OSVisualizers: React.FC = () => {
  const [selected, setSelected] = useState<'deadlock' | 'scheduler' | null>('deadlock');
  const [autoRun, setAutoRun] = useState(true);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">OS Visualizers</h1>
        <p className="text-gray-600">High-level interactive visualizations of OS concepts. Pick one visualizer and press Start to run.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-4 rounded-lg cursor-pointer border ${selected === 'deadlock' ? `border-primary-500 shadow-sm bg-white ${!autoRun ? 'animate-pulse ring-2 ring-pink-300/40' : ''}` : 'border-gray-200 bg-gray-50'}`} onClick={() => setSelected('deadlock')}>
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-semibold">Deadlock Detector</h3>
              <p className="text-sm text-gray-600">Detect circular waits in process-resource graphs and understand why deadlocks occur.</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg cursor-pointer border ${selected === 'scheduler' ? `border-primary-500 shadow-sm bg-white ${!autoRun ? 'animate-pulse ring-2 ring-pink-300/40' : ''}` : 'border-gray-200 bg-gray-50'}`} onClick={() => setSelected('scheduler')}>
          <div className="flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-semibold">Disk Scheduler</h3>
              <p className="text-sm text-gray-600">Compare FCFS, SSTF, SCAN and C-SCAN; visualize head movement and seek time.</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-gray-200 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold">Controls</h3>
            <p className="text-sm text-gray-600 mt-2">Select a visualizer and press Start to run the simulation. Only one visualizer runs at a time.</p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => { setAutoRun(false); setTimeout(() => setAutoRun(true), 10); }}
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-5 py-3 rounded-lg shadow-lg hover:scale-105 transform transition-all focus:ring-4 focus:ring-pink-300/40"
            >
              Start
            </button>
            <button
              onClick={() => setAutoRun(false)}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {selected === 'deadlock' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Deadlock Visualization</h2>
            <DeadlockVisualizer autoRun={autoRun} />
          </div>
        )}

        {selected === 'scheduler' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Disk Scheduler</h2>
            <DiskScheduler autoRun={autoRun} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OSVisualizers;
