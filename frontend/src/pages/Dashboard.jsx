import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  TrendingUp, 
  ArrowUpRight, 
  Camera, 
  UserPlus 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  const { summary, weekly_trend, recent_activity } = stats || {};

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time facial identification, attendance logging & security metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/enrollment"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll New Face</span>
          </Link>
          <Link
            to="/kiosk"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Live Kiosk</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="glass-card p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{summary?.total_users || 0}</h3>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 100% Active
            </span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Check-ins</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{summary?.today_attendance || 0}</h3>
            <span className="text-[11px] font-bold text-emerald-500">
              {summary?.attendance_rate}% Rate
            </span>
          </div>
        </div>

        {/* Punctuality Breakdown */}
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On-Time vs Late</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {summary?.on_time_count || 0} <span className="text-xs font-normal text-slate-400">/ {summary?.late_count || 0} Late</span>
            </h3>
            <span className="text-[11px] font-bold text-blue-500">Punctual</span>
          </div>
        </div>

        {/* Security / Unknown Detections */}
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unknown Subjects</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{summary?.unknown_today || 0}</h3>
            <span className="text-[11px] font-bold text-amber-500">Audit Alert</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Attendance Activity (Last 7 Days)</h3>
              <p className="text-xs text-slate-500">Comparison of daily on-time and late attendance logs</p>
            </div>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="on_time" name="On Time" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="late" name="Late Arrival" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Ticker */}
        <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Recent Recognition Feed</h3>
            <p className="text-xs text-slate-500 mb-4">Latest verification audit trail</p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recent_activity && recent_activity.length > 0 ? (
                recent_activity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          act.is_known
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {act.is_known ? act.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{act.name}</h4>
                        <p className="text-[10px] text-slate-400">{act.department} • {act.confidence}% Conf</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{act.timestamp}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No recognition logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
