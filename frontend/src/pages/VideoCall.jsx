import { useEffect, useRef, useState } from 'react';
import { FiVideo, FiPlay, FiStopCircle, FiInfo } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { GradientBadge, PageContainer, PageShell } from '../components/ui';

const VideoCall = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startPreview = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(media);
      setError('');
    } catch (err) {
      setError('Unable to access camera or microphone. Please allow permissions.');
    }
  };

  const stopPreview = () => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-6xl py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <GradientBadge>Live Video</GradientBadge>
            <h1 className="mt-3 text-4xl font-semibold text-white">Video call preview</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Use this page to preview your camera and microphone before starting a campus video session.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={startPreview} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
              <FiPlay size={18} /> Start preview
            </button>
            <button onClick={stopPreview} className="btn-ghost inline-flex items-center gap-2 px-5 py-3 text-sm">
              <FiStopCircle size={18} /> Stop preview
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="mb-4 flex items-center gap-3">
              <FiVideo className="text-cyan-400" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-white">Live camera preview</h2>
                <p className="text-sm text-slate-400">This local preview uses your browser media devices and does not connect a peer call yet.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/80 p-2">
              {stream ? (
                <video ref={videoRef} autoPlay playsInline muted className="h-[360px] w-full rounded-3xl object-cover" />
              ) : (
                <div className="flex h-[360px] items-center justify-center rounded-3xl bg-white/5 text-slate-500">
                  <span className="text-sm">Camera preview is offline. Start preview to enable your feed.</span>
                </div>
              )}
            </div>
            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <FiInfo className="text-violet-400" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-white">How to use</h2>
                <p className="text-sm text-slate-400">Allow camera and mic access, then use this view before joining a student video call.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>• Use the preview to confirm your webcam and microphone are working.</li>
              <li>• This page does not yet connect two peers; it provides a local readiness check.</li>
              <li>• For full video calling, integrate a signaling server or WebRTC peer flow next.</li>
            </ul>
            <div className="rounded-3xl bg-white/5 p-4 text-slate-300">
              <p className="text-sm font-semibold text-white">Tip</p>
              <p className="mt-2 text-sm">If your camera does not load, refresh the page and allow permission when prompted.</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default VideoCall;
