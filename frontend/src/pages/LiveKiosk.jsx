import React, { useState } from 'react';
import WebcamStream from '../components/face/WebcamStream';
import { Camera, ShieldCheck, UserCheck, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveKiosk = () => {
  const [recentScans, setRecentScans] = useState([]);

  const handleScanResult = (data) => {
    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      if (match.matched) {
        setRecentScans((prev) => {
          const exists = prev.some((s) => s.user.id === match.user.id);
          if (exists) return prev;
          return [{ ...match, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 8);
        });
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Live Attendance Kiosk</h1>
            <p className="text-xs text-slate-500">Automated non-contact face detection and punctuality logging</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>KIOSK ACTIVE</span>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WebcamStream onVerificationResult={handleScanResult} />
        </div>

        {/* Live Verifications Sidebar */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Check-ins</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500">
              Session Live
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {recentScans.length > 0 ? (
              recentScans.map((scan, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                      {scan.user.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{scan.user.full_name}</h4>
                      <p className="text-[10px] text-slate-400">{scan.user.department} • {scan.confidence}% Conf</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                    {scan.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-16 space-y-2">
                <Camera className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                <p className="text-xs font-medium text-slate-400">Waiting for subject in frame...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveKiosk;
