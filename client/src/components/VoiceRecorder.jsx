import React, { useState, useRef, useEffect, useCallback } from "react";

// Icons
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const MAX_DURATION = 120; // 2 minutes in seconds

const VoiceRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [waveformData, setWaveformData] = useState(new Array(40).fill(5));

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const analyserRef = useRef(null);
    const animFrameRef = useRef(null);
    const streamRef = useRef(null);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const cleanupStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            cleanupStream();
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [cleanupStream, audioUrl]);

    const updateWaveform = useCallback(() => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const bars = 40;
        const step = Math.floor(dataArray.length / bars);
        const newWaveform = [];
        for (let i = 0; i < bars; i++) {
            const value = dataArray[i * step] / 255;
            newWaveform.push(Math.max(5, value * 60));
        }
        setWaveformData(newWaveform);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Setup analyser for waveform
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm",
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                if (onRecordingComplete) {
                    const file = new File([blob], `voice-recording-${Date.now()}.webm`, {
                        type: "audio/webm",
                    });
                    onRecordingComplete(file);
                }
                cleanupStream();
            };

            mediaRecorder.start(250); // Collect data every 250ms
            setIsRecording(true);
            setDuration(0);
            setAudioUrl(null);

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration((prev) => {
                    if (prev >= MAX_DURATION - 1) {
                        stopRecording();
                        return MAX_DURATION;
                    }
                    return prev + 1;
                });
            }, 1000);

            // Start waveform animation
            updateWaveform();
        } catch (err) {
            console.error("Mic access error:", err);
            alert("Microphone access denied. Please allow microphone access to record.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsRecording(false);
        setWaveformData(new Array(40).fill(5));
    };

    const deleteRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setDuration(0);
        setIsPlaying(false);
        setPlaybackProgress(0);
        if (onRecordingComplete) onRecordingComplete(null);
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setPlaybackProgress(progress || 0);
    };

    const progressPercent = (duration / MAX_DURATION) * 100;

    return (
        <div className="voice-recorder-container">
            <label className="form-label flex items-center gap-2">
                <MicIcon />
                Voice Recording (Optional - max 2 min)
            </label>

            {/* Recording State */}
            {!audioUrl && !isRecording && (
                <button
                    type="button"
                    onClick={startRecording}
                    className="voice-record-start-btn"
                >
                    <div className="voice-mic-pulse">
                        <MicIcon />
                    </div>
                    <div>
                        <p className="font-semibold text-white">Start Recording</p>
                        <p className="text-xs text-[#94A3B8]">Click to record your complaint verbally (up to 2 minutes)</p>
                    </div>
                </button>
            )}

            {/* Active Recording */}
            {isRecording && (
                <div className="voice-recording-active">
                    {/* Waveform */}
                    <div className="voice-waveform">
                        {waveformData.map((height, i) => (
                            <div
                                key={i}
                                className="voice-waveform-bar"
                                style={{
                                    height: `${height}%`,
                                    animationDelay: `${i * 0.02}s`,
                                    background: `linear-gradient(to top, #1B6B3A, #4A90D9)`,
                                    opacity: 0.6 + (height / 60) * 0.4,
                                }}
                            />
                        ))}
                    </div>

                    {/* Timer & Progress */}
                    <div className="voice-timer-section">
                        <div className="flex items-center gap-3">
                            <div className="voice-recording-indicator" />
                            <span className="text-2xl font-mono font-bold text-white">{formatTime(duration)}</span>
                            <span className="text-sm text-[#64748B]">/ {formatTime(MAX_DURATION)}</span>
                        </div>
                        <div className="voice-progress-bar">
                            <div
                                className="voice-progress-fill"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <button
                        type="button"
                        onClick={stopRecording}
                        className="voice-stop-btn"
                    >
                        <StopIcon />
                        <span>Stop Recording</span>
                    </button>
                </div>
            )}

            {/* Recorded Audio Preview */}
            {audioUrl && !isRecording && (
                <div className="voice-preview-card">
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={handleAudioEnded}
                        onTimeUpdate={handleTimeUpdate}
                    />

                    <div className="voice-preview-header">
                        <div className="flex items-center gap-3">
                            <div className="voice-audio-icon">
                                <MicIcon />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Voice Recording</p>
                                <p className="text-xs text-[#64748B]">{formatTime(duration)} recorded</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={deleteRecording}
                            className="voice-delete-btn"
                            title="Delete recording"
                        >
                            <TrashIcon />
                        </button>
                    </div>

                    {/* Playback bar */}
                    <div className="voice-playback-section">
                        <button
                            type="button"
                            onClick={togglePlayback}
                            className="voice-play-btn"
                        >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <div className="voice-playback-bar">
                            <div
                                className="voice-playback-fill"
                                style={{ width: `${playbackProgress}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-xs text-[#64748B] mt-2 text-center">✅ Recording ready to submit with your complaint</p>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
