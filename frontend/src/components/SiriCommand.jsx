import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMic, FiSearch } from 'react-icons/fi';

const SiriCommand = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0]?.transcript?.trim();
      if (text) {
        setTranscript(text);
        navigate(`/marketplace?search=${encodeURIComponent(text)}`);
      }
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [navigate]);

  const startListening = () => {
    if (!recognitionRef.current) {
      window.alert('Voice search is not supported in this browser.');
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <div className="mt-8 sm:mt-10 inline-flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-white/10 bg-slate-900/70 px-5 py-5 text-center shadow-2xl shadow-slate-900/50 backdrop-blur-xl sm:max-w-2xl mx-auto">
      <div className="flex items-center gap-3 rounded-3xl bg-indigo-600/10 px-4 py-3 text-white shadow-inner shadow-indigo-500/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-500/20 text-indigo-200">
          <FiMic size={24} />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">Voice search for campus help</p>
          <p className="text-xs text-slate-400">Tap the mic and say something like “Find React tutors”.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button onClick={startListening} className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto">
          {listening ? 'Listening…' : 'Start voice search'}
        </button>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300">
          <FiSearch /> {transcript || 'Say a search term to explore services'}
        </span>
      </div>
    </div>
  );
};

export default SiriCommand;
