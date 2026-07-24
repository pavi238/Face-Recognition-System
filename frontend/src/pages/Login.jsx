import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ScanFace, Lock, User, Camera, ShieldCheck } from 'lucide-react';
import WebcamStream from '../components/face/WebcamStream';

const Login = () => {
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'face'
  const [username, setUsername] = useState('admin@facerec.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { loginWithPassword, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithPassword(username, password);
      addToast("Successfully logged in!", "success", "Welcome");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || "Invalid email or password", "error", "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerifyResult = (data) => {
    if (loading || authMethod !== 'face') return;
    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      if (match.matched && match.access_token && match.user) {
        setLoading(true);
        // Instant passwordless login via face recognition token
        localStorage.setItem('token', match.access_token);
        setUser(match.user);
        addToast(`Identity Verified: Welcome ${match.user.full_name}!`, "success", "Face Login Successful");
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Login Panel */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/30 mb-4">
            <ScanFace className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">VisionVault</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Face Recognition & Attendance Intelligence</p>
        </div>

        <div className="glass-panel p-8 bg-slate-900/90 border border-slate-800 shadow-2xl">
          {/* Auth Method Selector */}
          <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
            <button
              onClick={() => setAuthMethod('password')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                authMethod === 'password'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
            <button
              onClick={() => setAuthMethod('face')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                authMethod === 'face'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Face Login</span>
            </button>
          </div>

          {authMethod === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address or Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@facerec.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In to System'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-400">Position your face in front of camera for instant recognition</p>
              <div className="rounded-xl overflow-hidden border border-slate-800">
                <WebcamStream onVerificationResult={handleFaceVerifyResult} />
              </div>
            </div>
          )}
        </div>

        {/* Demo Credentials Helper */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 font-medium">Default Administrator Credentials:</p>
          <p className="text-xs font-bold text-indigo-400 mt-0.5">Email: admin@facerec.com | Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
