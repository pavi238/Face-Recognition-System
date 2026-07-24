import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, Volume2, VolumeX, ShieldCheck, UserX } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const WebcamStream = ({ onVerificationResult, autoRecordAttendance = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [detectionOverlay, setDetectionOverlay] = useState(null);
  const { addToast } = useToast();

  const playChime = (type = 'success') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
      }
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio alert playback suppressed:", e);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      addToast("Failed to access camera. Please check browser permissions.", "error", "Camera Error");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !cameraActive || verifying) return;

    const video = videoRef.current;
    if (video.readyState !== 4) return;

    // Capture frame to canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const b64Frame = canvas.toDataURL('image/jpeg', 0.85);

    setVerifying(true);
    try {
      const res = await api.post('/face/verify', { image: b64Frame });
      const data = res.data;

      if (data.results && data.results.length > 0) {
        setDetectionOverlay(data.results[0]);
        const firstResult = data.results[0];

        if (firstResult.matched) {
          playChime('success');
          if (data.attendance_recorded) {
            addToast(`Attendance logged for ${firstResult.user.full_name}`, "success", "Face Recognized");
          }
        } else {
          playChime('error');
        }

        if (onVerificationResult) {
          onVerificationResult(data);
        }
      } else {
        setDetectionOverlay(null);
      }
    } catch (err) {
      console.error("Frame processing error:", err);
    } finally {
      setVerifying(false);
    }
  }, [cameraActive, verifying, soundEnabled, onVerificationResult, addToast]);

  // Periodic frame verification loop (every 1.2s)
  useEffect(() => {
    const interval = setInterval(() => {
      processFrame();
    }, 1200);
    return () => clearInterval(interval);
  }, [processFrame]);

  return (
    <div className="relative glass-card overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-black">
      {/* Video Stream Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-[440px] object-cover"
      />

      {/* Live Overlay Canvas & Bounding Box */}
      {detectionOverlay && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
          <div
            className={`w-52 h-64 border-2 rounded-2xl transition-all duration-300 flex flex-col justify-between p-3 ${
              detectionOverlay.matched
                ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : 'border-rose-500 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase text-white bg-black/60 px-2 py-1 rounded-md backdrop-blur-md">
              <span>{detectionOverlay.matched ? 'Verified' : 'Unknown'}</span>
              <span>{detectionOverlay.confidence}% Conf</span>
            </div>
            <div className="text-center bg-black/80 backdrop-blur-md text-white p-2 rounded-xl border border-white/10">
              <p className="font-bold text-xs">
                {detectionOverlay.matched ? detectionOverlay.user.full_name : 'Unknown Person'}
              </p>
              <p className="text-[10px] opacity-75">
                {detectionOverlay.matched ? detectionOverlay.user.department : 'Access Restricted'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors border border-white/10"
          title="Toggle Audio Alerts"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
        <button
          onClick={startCamera}
          className="p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors border border-white/10"
          title="Restart Stream"
        >
          <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Live Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        <span>LIVE SCANNER</span>
      </div>
    </div>
  );
};

export default WebcamStream;
