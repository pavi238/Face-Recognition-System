import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sliders, Volume2, Clock, Camera, Save, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Settings = () => {
  const [settings, setSettings] = useState({
    confidence_threshold: 0.50,
    detector_model: 'hog',
    work_start_time: '09:00',
    camera_device_index: 0,
    enable_audio_alerts: true,
    enable_liveness_check: true,
    duplicate_log_cooldown_seconds: 60,
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/');
        setSettings(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/', settings);
      addToast("System parameters updated successfully!", "success");
    } catch (e) {
      addToast("Failed to update system settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Settings & Computer Vision Tuning</h1>
        <p className="text-xs text-slate-500">Configure face recognition tolerances, punctuality thresholds, and alert chimes</p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-8 space-y-6">
        {/* Confidence Distance Threshold Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Recognition Vector Distance Tolerance: <span className="text-indigo-500 font-mono font-bold">{settings.confidence_threshold}</span>
            </label>
            <span className="text-[10px] text-slate-400">Strict (0.35) ↔ Generous (0.65)</span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.70"
            step="0.05"
            value={settings.confidence_threshold}
            onChange={(e) => setSettings({ ...settings, confidence_threshold: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <p className="text-[11px] text-slate-400">
            Lower thresholds reduce false positive matches, while higher thresholds accommodate lighting shifts and facial accessories.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Work Start Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Workplace Start Time (Punctuality Benchmark)
            </label>
            <input
              type="time"
              value={settings.work_start_time}
              onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Camera Input Index */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              Primary Camera Device Index
            </label>
            <select
              value={settings.camera_device_index}
              onChange={(e) => setSettings({ ...settings, camera_device_index: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value={0}>Camera 0 (Default Webcam)</option>
              <option value={1}>Camera 1 (External USB Camera)</option>
              <option value={2}>Camera 2 (Secondary Sensor)</option>
            </select>
          </div>
        </div>

        {/* Audio Alerts & Liveness Toggles */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Audio Recognition Chime</h4>
              <p className="text-[10px] text-slate-400">Play pleasant sound upon successful match</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_audio_alerts}
              onChange={(e) => setSettings({ ...settings, enable_audio_alerts: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Duplicate Check-in Cooldown</h4>
              <p className="text-[10px] text-slate-400">Avoid re-logging same user within 60s</p>
            </div>
            <input
              type="number"
              value={settings.duplicate_log_cooldown_seconds}
              onChange={(e) => setSettings({ ...settings, duplicate_log_cooldown_seconds: parseInt(e.target.value) })}
              className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
