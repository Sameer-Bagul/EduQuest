import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "@/lib/voice";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderComponentProps {
  onTranscriptChange: (transcript: string) => void;
  initialTranscript?: string;
  disabled?: boolean;
  allowTextEdit?: boolean;
}

export function VoiceRecorderComponent({
  onTranscriptChange,
  initialTranscript = "",
  disabled = false,
  allowTextEdit = true,
}: VoiceRecorderComponentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [isSupported, setIsSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const supported = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
    setIsSupported(supported);

    if (!supported) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Please use a supported browser like Chrome or Edge for voice features.",
        variant: "destructive",
      });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [toast]);

  useEffect(() => {
    setTranscript(initialTranscript);
  }, [initialTranscript]);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not available in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      voiceRecorderRef.current?.stop();
    } else {
      voiceRecorderRef.current = new VoiceRecorder({
        onTranscript: (newTranscript, isFinal) => {
          if (isFinal) {
            setTranscript(prev => {
              const updated = prev + (prev ? ' ' : '') + newTranscript;
              onTranscriptChange(updated);
              return updated;
            });
          }
        },
        onStart: () => {
          setIsRecording(true);
          startTimer();
        },
        onStop: () => {
          setIsRecording(false);
          stopTimer();
        },
        onError: (error) => {
          setIsRecording(false);
          stopTimer();
          toast({
            title: "Recording Error",
            description: error,
            variant: "destructive",
          });
        },
        continuous: true,
      });
      voiceRecorderRef.current.start();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    onTranscriptChange("");
  };

  const handleTextChange = (value: string) => {
    setTranscript(value);
    onTranscriptChange(value);
  };

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Voice Answer</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mic className="w-4 h-4" />
            <span>Click to record your answer</span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-6">
          <Button
            onClick={toggleRecording}
            disabled={disabled || !isSupported}
            size="lg"
            className={`w-24 h-24 rounded-full transition-all transform hover:scale-105 ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-primary hover:bg-blue-700'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : !isSupported ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>

          <div className="text-center">
            {isRecording ? (
              <div className="text-lg font-medium text-red-600 recording-indicator">
                Recording... {formatTime(recordingTime)}
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-900">
                {isSupported ? 'Ready to record' : 'Voice not supported'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Live Transcription</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTranscript}
              className="text-xs text-gray-500 hover:text-gray-700 h-auto p-1"
            >
              Clear
            </Button>
          </div>

          {allowTextEdit ? (
            <Textarea
              value={transcript}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Your speech will appear here... You can also type or edit directly."
              className="min-h-[80px] border-0 p-0 resize-none focus-visible:ring-0"
              disabled={disabled}
            />
          ) : (
            <div className="text-gray-600 text-sm leading-relaxed min-h-[80px]">
              {transcript || "Your speech will appear here..."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
