import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export const Settings = () => {
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        (async () => {
            try {
                const s = await window.electronAPI.getSettings();
                setSettings(s || {});
            }
            catch (e) {
                console.warn('Failed to load settings', e);
            }
        })();
    }, []);
    const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
    const save = async () => {
        setSaving(true);
        try {
            await window.electronAPI.saveSettings(settings);
            alert('Settings saved');
        }
        catch (e) {
            console.error(e);
            alert('Save failed');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "bg-white rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Settings" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Default min file size (bytes)" }), _jsx("input", { type: "number", value: settings?.defaultMinSize ?? 1024, onChange: e => update('defaultMinSize', Number(e.target.value)), className: "mt-1 p-2 border rounded w-64" })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: !!settings?.enableTrash, onChange: e => update('enableTrash', e.target.checked) }), _jsx("span", { className: "text-sm", children: "Move deleted files to Trash/Quarantine instead of permanent delete" })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "AutoSort categories (comma separated)" }), _jsx("input", { type: "text", value: (settings?.autosortCategories || []).join(', '), onChange: e => update('autosortCategories', e.target.value.split(',').map((s) => s.trim())), className: "mt-1 p-2 border rounded w-full" })] }), _jsx("div", { className: "pt-4", children: _jsx("button", { onClick: save, disabled: saving, className: "px-3 py-2 bg-blue-600 text-white rounded", children: saving ? 'Saving...' : 'Save Settings' }) })] })] }) }));
};
export default Settings;
//# sourceMappingURL=Settings.js.map