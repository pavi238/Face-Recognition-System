import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle, RefreshCw, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const STEPS = [
  { label: 'Frontal View', instruction: 'Look directly into the camera with a neutral expression' },
  { label: 'Left Angle', instruction: 'Slightly tilt your head 20 degrees to your left' },
  { label: 'Right Angle', instruction: 'Slightly tilt your head 20 degrees to your right' },
];

const EnrollmentWizard = ({ onComplete, userId = null }) => {
  const videoRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [streamActive, setStreamActive] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let mediaStream = null;
    const startWebcam = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStreamActive(true);
      } catch (e) {
        addToast("Unable to access camera for face enrollment", "error");
      }
    };
    startWebcam();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [addToast]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL('image/jpeg', 0.9);

    const newCaptures = [...capturedImages, b64];
    setCapturedImages(newCaptures);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      addToast(`Captured ${STEPS[currentStep].label}! Next: ${STEPS[currentStep + 1].label}`, "info");
    } else {
      addToast("All 3 facial angles captured successfully!", "success");
      if (onComplete) {
        onComplete(newCaptures);
      }
    }
  };

  const resetCapture = () => {
    setCapturedImages([]);
    setCurrentStep(0);
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => (
          <div key={idx} className="flex-1 flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                idx < capturedImages.length
                  ? 'bg-emerald-500 text-white'
                  : idx === currentStep
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {idx < capturedImages.length ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{step.label}</p>
              <p className="text-[10px] text-slate-400">Step {idx + 1} of 3</p>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-slate-200 dark:bg-slate-800" />
            )}
          </div>
        ))}
      </div>

      {/* Instruction Banner */}
      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-center">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
          {STEPS[currentStep]?.instruction || 'Enrollment Complete'}
        </p>
      </div>

      {/* Camera Preview Area */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-80 object-cover" />
        
        {/* Face Oval Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-full animate-pulse" />
        </div>

        {/* Floating Capture Action */}
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
          {capturedImages.length < 3 ? (
            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              <span>Capture {STEPS[currentStep].label}</span>
            </button>
          ) : (
            <button
              onClick={resetCapture}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake All Angles</span>
            </button>
          )}
        </div>
      </div>

      {/* Captured Thumbnails Gallery */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-hidden flex flex-col items-center justify-center relative"
          >
            {capturedImages[i] ? (
              <>
                <img src={capturedImages[i]} alt={`Angle ${i}`} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  OK
                </span>
              </>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">{STEPS[i].label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnrollmentWizard;
