import React, { useEffect, useState } from 'react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await window.electronAPI.getSettings();
        setSettings(s || {});
      } catch (e) {
        console.warn('Failed to load settings', e);
      }
    })();
  }, []);

  const update = (key: string, value: any) => setSettings(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await window.electronAPI.saveSettings(settings);
      alert('Settings saved');
    } catch (e) {
      console.error(e);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Default min file size (bytes)</label>
            <input type="number" value={settings?.defaultMinSize ?? 1024} onChange={e => update('defaultMinSize', Number(e.target.value))} className="mt-1 p-2 border rounded w-64" />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!settings?.enableTrash} onChange={e => update('enableTrash', e.target.checked)} />
              <span className="text-sm">Move deleted files to Trash/Quarantine instead of permanent delete</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium">AutoSort categories (comma separated)</label>
            <input type="text" value={(settings?.autosortCategories || []).join(', ')} onChange={e => update('autosortCategories', e.target.value.split(',').map((s: string) => s.trim()))} className="mt-1 p-2 border rounded w-full" />
          </div>

          <div className="pt-4">
            <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save Settings'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
