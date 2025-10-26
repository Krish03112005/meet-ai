import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { VOICE_API_URL } from "@/config/constants";

interface VoiceChatProps {
  agentName: string;
  agentPersona: string;
}

interface AudioState {
  url: string | null;
  isPlaying: boolean;
}

export function VoiceChat({ agentName, agentPersona }: VoiceChatProps) {
  const [recording, setRecording] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({ url: null, isPlaying: false });
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      setStatus("Requesting microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioState({ url: URL.createObjectURL(blob), isPlaying: false });
        setStatus("Uploading to backend...");
        await sendToBackend(blob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setStatus("Recording... Speak now!");
    } catch (error) {
      setStatus("Error accessing microphone");
      console.error("Microphone access error:", error);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setStatus("Stopped recording.");
    }
  }

  async function sendToBackend(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append("file", blob, "input.webm"); // keep as .webm for browser-compat
      formData.append("agentname", agentName);
      formData.append("persona", agentPersona);

      const response = await fetch(`${VOICE_API_URL}/voicechat/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioState({ url, isPlaying: true });

      const audio = new Audio(url);
      audio.onended = () => {
        setStatus("Call finished – ready for another");
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      };
      audio.play();
      setStatus("Playing TTS reply...");
    } catch (error) {
      setStatus("Error processing voice chat");
      console.error("Voice chat error:", error);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <h3 className="font-semibold">Voice Call/Meet</h3>
      <div className="space-y-2">
        <Button
          variant={recording ? "destructive" : "default"}
          onClick={recording ? stopRecording : startRecording}
          className="mr-2"
        >
          {recording ? "Stop Recording" : "Start Call/Meet"}
        </Button>
        <span className="text-sm">
          <strong>Status:</strong> {status}
        </span>
      </div>
      {audioState.url && (
        <div className="mt-2 space-y-2">
          <audio src={audioState.url} controls className="w-full" />
          {audioState.isPlaying && <p className="text-sm">(TTS reply will auto-play)</p>}
        </div>
      )}
    </div>
  );
}
