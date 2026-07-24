import React, { useState, useEffect } from 'react';
import EnrollmentWizard from '../components/face/EnrollmentWizard';
import { UserCheck, Camera, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Enrollment = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/');
        setUsers(res.data);
        if (res.data.length > 0) {
          setSelectedUserId(res.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const handleEnrollComplete = async (capturedImages) => {
    if (!selectedUserId) {
      addToast("Please select a target user first.", "warning");
      return;
    }
    setEnrolling(true);
    try {
      await api.post('/face/enroll', {
        user_id: parseInt(selectedUserId),
        images: capturedImages,
        labels: ['Frontal View', 'Left Angle', 'Right Angle']
      });
      addToast("Facial vector encodings saved to database!", "success");
    } catch (err) {
      addToast(err.response?.data?.detail || "Enrollment failed", "error");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Shot Face Enrollment</h1>
        <p className="text-xs text-slate-500">Capture 3 distinct facial angles to maximize vector matching precision</p>
      </div>

      {/* Target User Selector */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select Personnel Account for Enrollment *
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name} ({u.employee_id}) — {u.enrolled_faces_count} Enrolled Samples
            </option>
          ))}
        </select>
      </div>

      {/* Enrollment Wizard Container */}
      <EnrollmentWizard onComplete={handleEnrollComplete} userId={selectedUserId} />
    </div>
  );
};

export default Enrollment;
