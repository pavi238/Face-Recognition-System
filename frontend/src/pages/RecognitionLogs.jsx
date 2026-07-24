import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Eye, Camera, Filter } from 'lucide-react';
import api from '../services/api';
import { TableSkeleton } from '../components/common/SkeletonLoader';

const RecognitionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [knownFilter, setKnownFilter] = useState('');

  const fetchLogs = async () => {
    try {
      const params = {};
      if (knownFilter !== '') params.is_known = knownFilter === 'true';
      const res = await api.get('/logs/', { params });
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [knownFilter]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recognition & Security Audit Logs</h1>
          <p className="text-xs text-slate-500">Full audit trail of verified subjects and unrecognized face detections</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={knownFilter}
            onChange={(e) => setKnownFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Verification Logs</option>
            <option value="true">Recognized Subjects Only</option>
            <option value="false">Unknown Subjects Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="glass-panel overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Confidence Score</th>
                  <th className="p-4">Vector Distance</th>
                  <th className="p-4">Camera Source</th>
                  <th className="p-4">Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-xs">
                      {l.is_known ? l.user?.full_name : 'Unknown Subject'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 w-max ${
                        l.is_known
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {l.is_known ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{l.is_known ? 'VERIFIED' : 'UNRECOGNIZED'}</span>
                      </span>
                    </td>
                    <td className="p-4 font-bold text-indigo-500">{l.confidence}%</td>
                    <td className="p-4 font-mono text-slate-500">{l.distance}</td>
                    <td className="p-4 font-medium text-slate-500">{l.camera_id}</td>
                    <td className="p-4">
                      {l.snapshot_path ? (
                        <a
                          href={`http://localhost:8000${l.snapshot_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          <Eye className="w-3 h-3" /> View Image
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecognitionLogs;
